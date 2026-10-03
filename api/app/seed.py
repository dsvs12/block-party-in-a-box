"""Seed FICTIONAL sample data: `python -m app.seed`."""
from __future__ import annotations

from datetime import datetime, timezone

from . import rules as R
from .blocks import get_index
from .config import load_rules
from .db import (Base, Match, Message, Offer, SessionLocal, Signature, Thread, User, VendorAccount,
                 WeekendSlot, engine, new_id, new_token, Request, audit)


def _ts(day: str, hour: int = 12) -> datetime:
    return datetime.fromisoformat(f"{day}T{hour:02d}:00:00+00:00")


def run() -> dict:
    rules = load_rules()
    index = get_index()
    if engine.dialect.name == "sqlite":
        Base.metadata.create_all(engine)  # tests: no Alembic on SQLite
    db = SessionLocal()
    try:
        for t in reversed(Base.metadata.sorted_tables):
            db.execute(t.delete())
        db.flush()
        db.add_all([
            VendorAccount(id="va_icecream", business_name="Sample Ice Cream Co.", status="approved",
                          contact_email="icecream@example.org", approved_at=_ts("2026-09-01")),
            VendorAccount(id="va_taco", business_name="Sample Taco Cart", status="approved",
                          contact_email="taco@example.org", approved_at=_ts("2026-09-01")),
            VendorAccount(id="va_bounce", business_name="Sample Bounce House Rentals", status="invited",
                          contact_email="bounce@example.org"),
        ])
        db.flush()
        users = [
            User(id="u_a", role="resident", email="organizer-a@example.org",
                 display_name="Sample Organizer A", dev_token="dev-resident-a"),
            User(id="u_b", role="resident", email="organizer-b@example.org",
                 display_name="Sample Organizer B", dev_token="dev-resident-b"),
            User(id="u_ice", role="vendor", email="icecream@example.org", display_name="Sample Ice Cream Co.",
                 vendor_account_id="va_icecream", dev_token="dev-vendor-icecream"),
            User(id="u_taco", role="vendor", email="taco@example.org", display_name="Sample Taco Cart",
                 vendor_account_id="va_taco", dev_token="dev-vendor-taco"),
            User(id="u_bounce", role="vendor", email="bounce@example.org",
                 display_name="Sample Bounce House Rentals",
                 vendor_account_id="va_bounce", dev_token="dev-vendor-bounce"),
            User(id="u_rev", role="reviewer", email="reviewer@example.org",
                 display_name="Sample Reviewer", dev_token="dev-reviewer"),
        ]
        db.add_all(users)
        db.add_all([
            Offer(vendor_account_id="va_icecream", service="ice_cream", price_usd=300, max_guests=150,
                  jobs_per_day=2, includes="Soft serve and popsicles, up to 3 hours",
                  days=["saturday", "sunday"], zips=["60302", "60304"], active=True),
            Offer(vendor_account_id="va_taco", service="food_truck", price_usd=250, max_guests=120,
                  jobs_per_day=1, includes="Taco cart with two proteins, up to 2 hours",
                  days=["saturday"], zips=["60302", "60304"], active=True),
        ])
        db.flush()

        # (id, organizer, block, start, end, guests, status, nsigs, submitted_at, extras)
        specs = [
            ("r1", "u_a", "S CUYLER AVE|1100", "2027-06-12", "2027-06-26", 120, "approved", 10,
             _ts("2026-10-01", 9), {"approved_date": "2027-06-19"}),
            ("r2", "u_b", "HIGHLAND AVE|1100", "2027-06-12", "2027-06-26", 80, "submitted", 10,
             _ts("2026-10-01", 15), {}),
            ("r3", "u_a", "S HARVEY AVE|1100", "2027-07-10", "2027-07-24", 60, "collecting", 4, None, {}),
            ("r5", "u_b", "S EAST AVE|600", "2027-07-10", "2027-07-17", 140, "submitted", 10,
             _ts("2026-10-02", 9), {}),
            ("r7", "u_b", "S TAYLOR AVE|1100", "2027-08-07", "2027-08-07", 50, "rejected", 10,
             _ts("2026-10-02", 15), {"reject_reason": "Weekend is at 30 of 30."}),
            ("r9", "u_a", "S SCOVILLE AVE|1100", "2027-08-14", "2027-08-28", 0, "draft", 0, None, {}),
        ]
        nsig = 0
        for rid, org, bid, ds, de, guests, status, n, sub, extra in specs:
            block = index.by_id.get(bid)
            if block is None:
                print(f"WARNING: block {bid} not in index; inserting request {rid} anyway")
            req = Request(
                id=rid, organizer_id=org, block_id=bid, kind="party", date_start=ds, date_end=de,
                guests=guests or 60, services={"barricades": True, "green_kit": True}, status=status,
                petition_token=None if status == "draft" else new_token(),
                petition_due=R.petition_due(ds, rules["petition_lead_days"]),
                submitted_at=sub, rules_year=rules["rules_year"], version=1, **extra)
            if status in ("approved", "rejected"):
                req.decided_at = _ts("2026-10-03", 9)
                req.decided_by = "u_rev"
            db.add(req)
            lo = block["addr_lo"] if block else int(bid.split("|")[1])
            for i in range(n):
                db.add(Signature(id=new_id("sig"), request_id=rid, name=f"Sample Neighbor {i + 1}",
                                 house_number=str(lo + i), street=block["name"] if block else bid.split("|")[0],
                                 state="counted"))
                nsig += 1
        db.flush()

        db.add(WeekendSlot(weekend_key="2027-06-19", approved_count=1, version=1))

        offers = [
            {"vendor_account_id": "va_icecream", "status": "approved", "active": True, "service": "ice_cream",
             "max_guests": 150, "jobs_per_day": 2, "days": ["saturday", "sunday"], "zips": ["60302", "60304"],
             "accepted_on_date": 0, "already_matched": False, "service_filled": False},
            {"vendor_account_id": "va_taco", "status": "approved", "active": True, "service": "food_truck",
             "max_guests": 120, "jobs_per_day": 1, "days": ["saturday"], "zips": ["60302", "60304"],
             "accepted_on_date": 0, "already_matched": False, "service_filled": False},
        ]
        whys = {m["vendor_account_id"]: m["why"]
                for m in R.match({"date": "2027-06-19", "guests": 120, "zip": "60304"}, offers)}
        db.add(Match(id="m_r1_ice", request_id="r1", vendor_account_id="va_icecream", event_date="2027-06-19",
                     state="accepted", why=whys["va_icecream"], price_snapshot=300,
                     includes_snapshot="Soft serve and popsicles, up to 3 hours", service_snapshot="ice_cream",
                     decided_at=_ts("2026-10-03", 10)))
        db.add(Match(id="m_r1_taco", request_id="r1", vendor_account_id="va_taco", event_date="2027-06-19",
                     state="proposed", why=whys["va_taco"], price_snapshot=250,
                     includes_snapshot="Taco cart with two proteins, up to 2 hours",
                     service_snapshot="food_truck"))
        db.flush()

        db.add_all([Thread(id="t_r1", kind="request", request_id="r1"),
                    Thread(id="t_r2", kind="request", request_id="r2"),
                    Thread(id="t_r1_job", kind="job", request_id="r1", match_id="m_r1_ice")])
        db.flush()
        db.add(Message(id="msg_1", thread_id="t_r1", author_id="u_rev", author_role="village",
                       body="Please confirm where barricades should be dropped off.", created_at=_ts("2026-10-02", 10)))
        db.add(Message(id="msg_2", thread_id="t_r1", author_id="u_a", author_role="resident",
                       body="In front of 1105.", created_at=_ts("2026-10-02", 11)))
        audit(db, "u_rev", "approve", "request", "r1", after={"approved_date": "2027-06-19"})
        db.commit()
        counts = {"users": len(users), "vendor_accounts": 3, "offers": 2, "requests": len(specs),
                  "signatures": nsig, "matches": 2, "threads": 3, "messages": 2}
    finally:
        db.close()
    return counts


if __name__ == "__main__":
    print("Seeded:", run())
