var e=`Counting the 1s written between 1 and a billion is a billion digit loops, and no
amount of tightening the loop saves it. The way out is to stop asking each number
what it contains and start asking each *place* how many numbers put a 1 there —
which turns a billion turns into ten.

## 1. The problem

Given an integer \`n\`, count how many times the digit **1** appears when every
number from 1 to \`n\` is written out.

- **In** — \`n\`, an \`int\`, with \`0 <= n <= 10⁹\`.
- **Out** — the total count of the character \`1\`, as an \`int\`.

\`\`\`text
n = 0     ->  0
n = 1     ->  1
n = 13    ->  6      1, 10, 11, 12, 13 — and 11 is worth two on its own
n = 100   ->  21
n = 1234  ->  689
\`\`\`

Three things in that list are worth saying out loud before any code.

**It is digits, not numbers.** 11 contributes 2. A solution that counts *how many
numbers contain a 1* answers a different question and is wrong from n = 11
onwards, which is late enough that a hand-checked test on n = 10 will not catch
it.

**Zero is a real input.** Nothing is written between 1 and 0, so the answer is 0,
and it has to come back without a single turn of anything.

**The answer outgrows the input, and the ceiling in the statement is what keeps
it in an \`int\`.** For n = 10⁹ the count is 900000001 — comfortably inside
\`Integer.MAX_VALUE\`, but only just, and only because the statement stops there.
Push past it and the number to be returned no longer exists in the type it has to
be returned in. That comes back in section 7, because the code below has a line
that lets it happen silently.

## 2. The brute force

Walk every number, take it apart, and count the 1s in it.

\`\`\`java DigitOneScan.java @run-number-of-digit-one-digit-one-scan
static int countDigitOne(int n) {

    int total = 0;

    for (int x = 1; x <= n; x++) {

        int m = x;

        while (m > 0) {
            if (m % 10 == 1) {
                total++;
            }
            m /= 10;
        }
    }

    return total;
}

static long digitSteps(int n) {

    long steps = 0;

    for (int x = 1; x <= n; x++) {
        for (int m = x; m > 0; m /= 10) {
            steps++;
        }
    }

    return steps;
}
\`\`\`

\`\`\`output @run-number-of-digit-one-digit-one-scan
countDigitOne(0)       -> 0
countDigitOne(13)      -> 6
countDigitOne(100)     -> 21
countDigitOne(1234)    -> 689
countDigitOne(1000000) -> 600001
digitSteps(13)         -> 17
digitSteps(1000)       -> 2893
digitSteps(1000000)    -> 5888896
\`\`\`

\`\`\`demo DigitOneScan.java
countDigitOne(0)
countDigitOne(13)
countDigitOne(100)
countDigitOne(1234)
countDigitOne(1000000)
digitSteps(13)
digitSteps(1000)
digitSteps(1000000)
\`\`\`

### The code, line by line

- \`int total = 0;\` — the running count of **characters**, not of numbers. Nothing
  in the loop below ever asks "did this number have a 1", only "how many".
- \`for (int x = 1; x <= n; x++)\` — every number in the range, one at a time. For
  n = 0 this never enters and 0 falls straight through to the return, which is
  the right answer arrived at for the right reason rather than by a special case.
- \`int m = x;\` — a copy to destroy. \`x\` is the loop counter and taking digits off
  it directly would end the loop early.
- \`while (m > 0)\` — the digit loop. It runs once per digit of \`m\`, and it is the
  reason the cost below has a \`log\` in it.
- \`if (m % 10 == 1) { total++; }\` — the last digit, compared and thrown away.
  \`total++\` and not \`total = 1\`: **a number with two 1s in it adds two.**
- \`m /= 10;\` — drop the digit just looked at. Integer division, so 13 becomes 1
  and then 0, and the loop ends on its own.
- \`digitSteps\` is not part of the answer. It counts the turns the digit loop
  takes so the cost is a number on the page rather than a claim in a sentence.

## 3. Dry run of the brute force

\`countDigitOne(13)\`, one row per number:

| x | digits looked at | 1s found | total |
|---|---|---|---|
| 1 | 1 | 1 | 1 |
| 2 to 9 | one each | 0 | 1 |
| 10 | 0, 1 | 1 | 2 |
| 11 | 1, 1 | **2** | 4 |
| 12 | 2, 1 | 1 | 5 |
| 13 | 3, 1 | 1 | **6** |

The row for 11 is the whole reason \`total++\` sits inside the digit loop rather
than outside it.

Read \`digitSteps(13)\` in the output above: **17 turns** for a range of 13
numbers — nine one-digit numbers and four two-digit ones. The digit loop is
already costing more than one turn per number, and it only gets worse.

## 4. Why it is not enough

Time is **O(n log n)** — n numbers, each taken apart digit by digit — and space
is O(1). The \`log\` is harmless; the \`n\` is fatal.

Read the counter in the output above: \`digitSteps(1000000)\` is **5888896 turns**
for a million, and a million is one thousandth of the largest input allowed. The
statement permits n = 10⁹, which is around **nine billion** turns of that inner
loop. At a few hundred million simple operations a second that is most of a
minute, for one call.

The waste is not in the digit loop. It is in the question being asked. **A digit
loop asks a number what it contains**, and the answer for 1000 tells you nothing
about 1001 even though the two differ by one character.

Turn the question round and ask a *place* instead — how many numbers between 1
and n put a 1 in this particular column? Write out the ones column for the first
thirty numbers and the shape is immediate:

\`\`\`text
1  2  3  4  5  6  7  8  9  0     one 1 per block of ten
1  2  3  4  5  6  7  8  9  0     and the blocks never vary
1  2  3  4  5  6  7  8  9  0
\`\`\`

**Exactly one number in every block of ten ends in a 1.** So the ones column
contributes one per complete block, and the only interesting part of the sum is
the last block, which may be cut off partway through. The tens column is the same
with blocks of a hundred and a run of ten inside each. The hundreds column, blocks
of a thousand and a run of a hundred.

That is a closed form per column, and there are only as many columns as \`n\` has
digits. The work drops from *the size of n* to *the number of digits in n* —
against nine billion turns, that is **ten**.

It is the same trade [Pow(x, n)](problem:powx-n) and
[Divide Two Integers](problem:divide-two-integers) make: stop counting units and
start counting positions.

## 5. The plan, in pseudocode

Fix one place — call its value \`factor\`, so 1 for the ones column, 10 for the
tens. Split \`n\` around it into three pieces:

\`\`\`text
n = 1234, factor = 100

    1     2     34
  higher  curr  lower
\`\`\`

A number in the range with a 1 in that column looks like \`higher' 1 lower'\`,
where \`higher'\` runs from 0 up to some bound and \`lower'\` runs over every value
the column below can take. Counting them is counting how far each is allowed to
go:

\`\`\`pseudo
countDigitOne(n):

    factor <- 1
    count  <- 0

    while factor <= n:

        lower  <- n mod factor              the digits below the column
        curr   <- (n / factor) mod 10       the digit in the column
        higher <- n / (factor x 10)         the digits above it

        if curr = 0:
            count <- count + higher x factor            complete blocks only

        else if curr = 1:
            count <- count + higher x factor + lower + 1    and part of one more

        else:
            count <- count + (higher + 1) x factor       one more complete block

        factor <- factor x 10

    return count
\`\`\`

The three branches are one idea seen from three distances, and it is worth
spelling out which:

**\`higher x factor\` is the complete blocks, and it is in all three.** For every
value of \`higher'\` from 0 to \`higher - 1\`, the column below is unconstrained — it
can be anything from 0 to \`factor - 1\`, which is \`factor\` numbers. That is
\`higher\` blocks of \`factor\`.

**The branches only ever disagree about the last, partial block**, the one where
\`higher'\` equals \`higher\`. If \`curr\` is 0 that block never reaches a 1 in this
column at all. If \`curr\` is bigger than 1 the block sails past it, so the whole
\`factor\` of them count — which is the \`+ 1\` folded into \`(higher + 1)\`. And if
\`curr\` is exactly 1, the block stops partway: the numbers below it run 0 to
\`lower\`, and **\`lower + 1\` of them** because that range includes both ends.

## 6. Counting a place at a time

\`\`\`java DigitOne.java @run-number-of-digit-one-digit-one
static int countDigitOne(int n) {

    long factor = 1;
    int count = 0;

    while (factor <= n) {

        long lower = n % factor;
        long curr = (n / factor) % 10;
        long higher = n / (factor * 10);

        if (curr == 0)
            count += higher * factor;

        else if (curr == 1)
            count += higher * factor + lower + 1;

        else
            count += (higher + 1) * factor;

        factor *= 10;
    }

    return count;
}

static int turns(int n) {

    long factor = 1;
    int t = 0;

    while (factor <= n) {
        factor *= 10;
        t++;
    }

    return t;
}

static String place(int n, long factor) {

    long lower = n % factor;
    long curr = (n / factor) % 10;
    long higher = n / (factor * 10);

    long adds = curr == 0 ? higher * factor
              : curr == 1 ? higher * factor + lower + 1
              : (higher + 1) * factor;

    return "higher " + higher + ", curr " + curr
            + ", lower " + lower + "  ->  adds " + adds;
}

static String withIntFactor(int n) {

    int factor = 1;
    int count = 0;

    try {
        while (factor <= n) {

            int lower = n % factor;
            int curr = (n / factor) % 10;
            int higher = n / (factor * 10);

            if (curr == 0) count += higher * factor;
            else if (curr == 1) count += higher * factor + lower + 1;
            else count += (higher + 1) * factor;

            factor *= 10;
        }
    } catch (ArithmeticException e) {
        return "died, " + e;
    }

    return String.valueOf(count);
}
\`\`\`

\`\`\`output @run-number-of-digit-one-digit-one
countDigitOne(0)          -> 0
countDigitOne(1)          -> 1
countDigitOne(13)         -> 6
countDigitOne(100)        -> 21
countDigitOne(1234)       -> 689
countDigitOne(1000000)    -> 600001
countDigitOne(1000000000) -> 900000001
countDigitOne(2147483647) -> -1323939513
turns(13)                 -> 2
turns(1000000000)         -> 10
place(1234, 1)            -> higher 123, curr 4, lower 0  ->  adds 124
place(1234, 10)           -> higher 12, curr 3, lower 4  ->  adds 130
place(1234, 100)          -> higher 1, curr 2, lower 34  ->  adds 200
place(1234, 1000)         -> higher 0, curr 1, lower 234  ->  adds 235
withIntFactor(1000000000) -> 900000001
withIntFactor(2000000000) -> died, java.lang.ArithmeticException: / by zero
\`\`\`

\`\`\`demo DigitOne.java
countDigitOne(0)
countDigitOne(1)
countDigitOne(13)
countDigitOne(100)
countDigitOne(1234)
countDigitOne(1000000)
countDigitOne(1000000000)
countDigitOne(2147483647)
turns(13)
turns(1000000000)
place(1234, 1)
place(1234, 10)
place(1234, 100)
place(1234, 1000)
withIntFactor(1000000000)
withIntFactor(2000000000)
\`\`\`

### The code, line by line

- \`long factor = 1;\` — the column being counted, held as its **value** rather than
  its index: 1 is the ones, 10 the tens, 100 the hundreds. Every expression below
  is arithmetic on that value, which is why there is no \`Math.pow\` and no table.
- \`int count = 0;\` — the running total. An \`int\`, and section 7 has an argument
  about that.
- \`while (factor <= n)\` — one turn per digit of \`n\`, and it stops the moment the
  column is past the number. **For n = 0 the body never runs**, so 0 comes back
  with no special case guarding it.
- \`long lower = n % factor;\` — everything below the column. On the first turn
  \`factor\` is 1 and this is 0, which is correct: there is nothing below the ones.
- \`long curr = (n / factor) % 10;\` — shift the column into last position, then
  take it. These two operations in this order are the whole of "read one digit".
- \`long higher = n / (factor * 10);\` — everything above the column. **\`factor * 10\`
  is the expression that decides the type of the whole method**; see below.
- \`if (curr == 0) count += higher * factor;\` — the complete blocks and nothing
  else. The partial block sits below the column's 1 and never reaches it.
- \`else if (curr == 1) count += higher * factor + lower + 1;\` — the complete
  blocks, plus the part of the last one that actually happened. \`+ 1\` because
  the numbers below run from 0 to \`lower\` inclusive, and a count of an inclusive
  range is one more than its top.
- \`else count += (higher + 1) * factor;\` — \`curr\` is 2 or more, so the last block
  passed the 1 on its way and contributes in full. That is the complete-block
  formula with one more block in it.
- \`factor *= 10;\` — step up a column, and the reason the loop is O(digits).
- \`turns\`, \`place\` and \`withIntFactor\` are not part of the answer. The first puts
  the cost on screen, the second puts one column's arithmetic on screen, and the
  third puts the type argument on screen.

**\`long factor\` is not decoration.** Look at \`factor * 10\` on the \`higher\` line
with \`factor\` at 10⁹: that product is 10¹⁰, which does not fit in an \`int\` and
wraps to 1410065408. Read \`withIntFactor(1000000000)\` in the output above — it
still prints the right answer, purely because the wrapped divisor happens to be
larger than n and the division gives 0 anyway. The loop then ends because that
same wrapped value is what \`factor\` becomes next.

Now read \`withIntFactor(2000000000)\`. Past 10⁹ the wrapped \`factor\` is *smaller*
than n, so the loop does not end — it keeps stepping, wrapping further each time,
and a few turns later \`factor * 10\` lands on exactly **0**. The method dies
dividing by it.

That is the shape of a bug worth recognising. Inside the stated range the \`int\`
version passes, and it passes by luck rather than by argument; a little way
outside it, it throws. Writing \`long\` costs one keyword and removes the question.

## 7. Dry run of the fast version

\`countDigitOne(1234)\`, one row per column. The \`higher\`, \`curr\` and \`lower\`
columns are the three pieces \`n\` was split into, and they are exactly what
\`place(1234, …)\` prints in the output above.

| factor | higher | curr | lower | branch | adds | total |
|---|---|---|---|---|---|---|
| 1 | 123 | 4 | 0 | curr > 1 | (123 + 1) x 1 = 124 | 124 |
| 10 | 12 | 3 | 4 | curr > 1 | (12 + 1) x 10 = 130 | 254 |
| 100 | 1 | 2 | 34 | curr > 1 | (1 + 1) x 100 = 200 | 454 |
| 1000 | 0 | 1 | 234 | **curr = 1** | 0 x 1000 + 234 + 1 = 235 | **689** |

Four turns, against 1234 numbers and 3829 digit-loop turns for the same answer.

The last row is the one to be able to explain. The thousands column of 1234 holds
a 1, so the numbers with a 1 there are 1000 through 1234 — and that is 235 of
them, which is \`lower + 1\` and not \`lower\`. Off by one there is off by one in the
answer, and it is the single most common way this solution is got wrong.

![How n splits into higher, current digit and lower at one column, and the three rules that follow from it](diagrams/number-of-digit-one-notes-split.jpg)

Green is the digit in the column, blue the two pieces either side of it, and the
three boxes along the bottom are the branches. **The only thing the three
disagree about is the last, partial block** — the grey \`higher x factor\` term is
common to all of them.

Now the smaller case, \`countDigitOne(13)\`, where both branches that matter appear
in two rows:

| factor | higher | curr | lower | branch | adds | total |
|---|---|---|---|---|---|---|
| 1 | 1 | 3 | 0 | curr > 1 | (1 + 1) x 1 = 2 | 2 |
| 10 | 0 | 1 | 3 | **curr = 1** | 0 x 10 + 3 + 1 = 4 | **6** |

Two in the ones column — the numbers 1 and 11. Four in the tens — 10, 11, 12 and
13. Six altogether, and 11 has been counted once in each column, which is exactly
what "how many times is the character written" means.

Read \`turns(1000000000)\` in the output above: **ten**. Then read
\`countDigitOne(2147483647)\`, which comes back **negative**.

That is not a bug in the algorithm, it is the \`int\` in \`count\`. The true answer
there is 2971027783, which is past \`Integer.MAX_VALUE\` — and the reason it
compiles at all is \`+=\`. **A compound assignment carries an implicit narrowing
cast**, so \`count += higher * factor\` quietly truncates a \`long\` into an \`int\`
where the spelled-out \`count = count + higher * factor\` would have been a
compile error. The statement caps n at 10⁹ and the largest answer inside that cap
is 900000001, so this never fires on the judge. It is still worth knowing which
line let it through.

## 8. Key takeaways

- **Count columns, not numbers.** Walking 1 to n is O(n log n) and dies at 10⁹;
  asking each column how many numbers put a 1 in it is O(log n) — ten turns.
- **Split \`n\` into \`higher\`, \`curr\`, \`lower\` around the column.** Those three,
  plus \`factor\`, are the whole state; there is nothing else to carry.
- **\`higher x factor\` is the complete blocks and appears in every branch.** The
  branches differ only over the final, partial block.
- **\`curr = 1\` is the case with the \`+ 1\` in it.** The partial block runs from 0
  to \`lower\` inclusive, which is \`lower + 1\` numbers. Getting that wrong is the
  usual failure.
- **\`curr = 0\` contributes nothing extra; \`curr > 1\` contributes a whole extra
  block.** Two ways of saying "did the last block reach the 1, and did it pass it".
- **Hold \`factor\` in a \`long\`.** \`factor * 10\` wraps at the top of the range — to
  a harmless value inside the constraint, and to zero a little way outside it,
  where the method throws.
- **\`+=\` hides a narrowing cast.** \`count += someLong\` compiles and truncates;
  \`count = count + someLong\` does not compile. Know which one you wrote.
- **The digit is read as \`(n / factor) % 10\`.** Shift, then take. The same two
  operations read a digit anywhere on the sheet.
- **O(log n) time, O(1) space.** No array of powers, no recursion, no memo.
- **Test 0, 1, 13, 10⁹.** The first checks the loop never entering, the second and
  third the two branches, and the last that nothing overflowed on the way.
`;export{e as default};