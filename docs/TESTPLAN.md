# Test Plan for COBOL Student Account System

This test plan validates the business logic in the COBOL account application (`MainProgram`, `Operations`, `DataProgram`). Fill in `Actual Result` and `Status` during execution with stakeholders.

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status (Pass/Fail) | Comments |
|---|---|---|---|---:|---|---|---|
| TC-01 | View current balance | Application compiled and running; initial `STORAGE-BALANCE` = 1000.00 | 1. Start program. 2. Select menu option `1` (View Balance). | Display `Current balance: 001000.00` (or equivalent formatted 1000.00) |  |  | Verifies read flow from `DataProgram`. |
| TC-02 | Credit valid amount | App running; starting balance noted (e.g., 1000.00) | 1. Select `2` (Credit). 2. Enter valid numeric amount `250.00`. 3. Select `1` to view balance. | Balance increases by 250.00; new displayed balance = starting + 250.00 (e.g., 1250.00) |  |  | Verifies read→add→write sequence.
| TC-03 | Debit valid amount (sufficient funds) | App running; balance >= debit amount | 1. Select `3` (Debit). 2. Enter a valid numeric amount less than or equal to balance (e.g., 100.00). 3. Select `1` to view balance. | Balance decreases by debit amount; displayed balance = starting - amount |  |  | Verifies funds-check, subtract, write.
| TC-04 | Debit with insufficient funds | App running; choose amount greater than balance | 1. Select `3` (Debit). 2. Enter amount greater than current balance. | Display `Insufficient funds for this debit.` and balance unchanged. |  |  | Verifies rejection path; no write performed.
| TC-05 | Persistence within process (write persists to subsequent reads) | App running in same process | 1. Credit or debit an amount. 2. Immediately call View Balance. | The read after write returns updated value (write persisted in `STORAGE-BALANCE`). |  |  | Note: persistence is in-memory for process lifetime only.
| TC-06 | Menu invalid choice handling | App running | 1. Enter an invalid choice (e.g., `9` or non-numeric). | Display `Invalid choice, please select 1-4.` and return to menu. |  |  | Ensures main menu EVALUATE WHEN OTHER path.
| TC-07 | Operation string exact-match sensitivity | App compiled and running | 1. From `main.cob`, confirm it calls `Operations` with exact strings (`'TOTAL '`, `'CREDIT'`, `'DEBIT '`). 2. Manually simulate calling `Operations` with trimmed/altered string if possible. | Program relies on exact 6-character strings; mismatched strings will not trigger intended branch. |  |  | Highlights trailing-space dependency; consider normalising codes.
| TC-08 | Amount format - non-numeric input | App running | 1. Choose Credit or Debit. 2. Enter a non-numeric value (e.g., `abc`, `100,00`). | Behavior depends on COBOL runtime handling of `ACCEPT` into numeric `PIC`; likely numeric conversion error or input truncated/treated as zeros. |  |  | Mark as risk: no input validation in current code.
| TC-09 | Amount format - negative value | App running | 1. Choose Credit or Debit. 2. Enter `-100.00`. | COBOL `PIC 9(6)V99` does not accept sign by default — input may be rejected or misinterpreted; expected: system should reject negative amounts (current code does not check). |  |  | Recommend adding validation in future Node.js port.
| TC-10 | Amount exceeds field max | App running | 1. Choose Credit. 2. Enter `1000000.00` (one million) which exceeds `PIC 9(6)V99` max (999,999.99). | Input should overflow/produce runtime error or truncate; expected behavior: reject or fail validation. |  |  | Important boundary test for limits.
| TC-11 | Concurrent sequence: Credit then Debit then View | App running | 1. Choose Credit `200.00`. 2. Choose Debit `150.00`. 3. Choose View Balance. | Balance reflects both operations (starting +200 -150). |  |  | Verifies correct cumulative updates.
| TC-12 | Program exit | App running | 1. Select `4` (Exit). | Program prints `Exiting the program. Goodbye!` and terminates with exit code 0. |  |  | Confirms graceful shutdown.


> Notes for testers and stakeholders:
> - `Actual Result` and `Status` columns are intentionally left empty for recording observed outcomes during testing sessions with stakeholders.
> - The current COBOL implementation performs minimal input validation. Any non-numeric or malformed input behavior should be captured in `Actual Result` and considered for acceptance criteria during stakeholder review.
> - For integration/unit test mapping in Node.js later: each table row maps to one or more automated tests — unit tests for `Operations` and `DataProgram` logic, integration tests for end-to-end menu flows or an exported API.

