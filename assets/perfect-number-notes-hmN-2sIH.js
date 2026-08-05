var e=`A perfect number equals the sum of its own divisors, not counting itself. 6 is
one — 1 + 2 + 3. The definition hands you a loop, and the loop is a hundred
million turns wide at the top of the range. The fix is the oldest observation in
number theory: divisors come in pairs.

## 1. The problem

Given an integer \`num\`, return \`true\` if it is a perfect number.

- **In** — \`num\`, an \`int\`, and \`1 <= num <= 10⁸\`.
- **Out** — \`boolean\`.
- **Perfect** — the sum of all **positive divisors of \`num\` excluding \`num\`
  itself** equals \`num\`.

Two words in that definition do the work.

**"Excluding itself."** Every number divides itself, so if \`num\` were included
the sum would always be too big and nothing would ever be perfect. The divisors
being summed are the *proper* ones — for 28 they are 1, 2, 4, 7 and 14.

**"Positive."** Negative divisors are not in play, and neither is 0, which
divides nothing.

That leaves one input needing thought: **\`num = 1\`**. Its only divisor is 1, which
is also itself, so the proper divisors sum to 0 — and 0 is not 1. **1 is not
perfect**, and it is the input that catches code which starts its sum at 1
without checking.

**There are only five perfect numbers in the range** — 6, 28, 496, 8128 and
33550336 — which is a fact worth holding on to until the end of the page.

## 2. The brute force

Read the definition straight down: try every number below \`num\`, keep the ones
that divide, add them up.

\`\`\`java PerfectScan.java @run-perfect-number-perfect-scan
static boolean checkPerfectNumber(int num) {

    if (num <= 1) {
        return false;
    }

    int sum = 0;

    for (int d = 1; d < num; d++) {
        if (num % d == 0) {
            sum = sum + d;
        }
    }

    return sum == num;
}
\`\`\`

\`\`\`output @run-perfect-number-perfect-scan
checkPerfectNumber(1)        -> false
checkPerfectNumber(4)        -> false
checkPerfectNumber(6)        -> true
checkPerfectNumber(12)       -> false
checkPerfectNumber(16)       -> false
checkPerfectNumber(28)       -> true
checkPerfectNumber(496)      -> true
checkPerfectNumber(8128)     -> true
checkPerfectNumber(33550336) -> true
\`\`\`

\`\`\`demo PerfectScan.java
checkPerfectNumber(1)
checkPerfectNumber(4)
checkPerfectNumber(6)
checkPerfectNumber(12)
checkPerfectNumber(16)
checkPerfectNumber(28)
checkPerfectNumber(496)
checkPerfectNumber(8128)
checkPerfectNumber(33550336)
\`\`\`

### The code, line by line

- \`if (num <= 1) return false;\` — 1 has no proper divisors and 0 and the
  negatives are outside the constraints. Without this line \`num = 1\` runs a loop
  that never executes, leaves \`sum\` at 0, and compares \`0 == 1\` — which happens
  to be correct. The guard is here because *relying* on that is fragile: the
  moment \`sum\` starts at 1 instead of 0, as it will in the faster version, the
  accident stops working.
- \`int sum = 0;\` — an \`int\` is enough. The proper divisor sum of a perfect number
  is the number itself, and for anything else the loop is going to reject it
  anyway; the largest sum reachable inside \`10⁸\` stays well under
  \`Integer.MAX_VALUE\`.
- \`for (int d = 1; d < num; d++)\` — **\`d < num\`, strictly.** This is where
  "excluding itself" is implemented. Writing \`d <= num\` makes every number's sum
  overshoot by exactly \`num\`, and nothing is ever perfect.
- \`if (num % d == 0) sum = sum + d;\` — the whole of the definition, in one line.
  A remainder of zero is what "divides" means.
- \`return sum == num;\` — no tolerance, no rounding. Everything here is an integer.

## 3. Dry run of the brute force

\`num = 28\`, which is perfect. Only the turns that find a divisor are shown; the
other twenty-two do nothing but a \`%\`.

| d | 28 % d | divides? | sum after |
|---|---|---|---|
| 1 | 0 | yes | 1 |
| 2 | 0 | yes | 3 |
| 4 | 0 | yes | 7 |
| 7 | 0 | yes | 14 |
| 14 | 0 | yes | **28** |
| 3, 5, 6, 8 … 27 | ≠ 0 | no | unchanged |
| end | — | — | \`28 == 28\` → **true** |

And \`num = 12\`, which is not — it is *abundant*, its divisors overshoot:

| d | divides? | sum after |
|---|---|---|
| 1 | yes | 1 |
| 2 | yes | 3 |
| 3 | yes | 6 |
| 4 | yes | 10 |
| 6 | yes | **16** |
| end | — | \`16 == 12\` is false → **false** |

**Twenty-seven turns to find five divisors** for 28, and eleven turns to find
five for 12. The ratio only gets worse as the numbers grow: a number near 10⁸
has a handful of divisors and the loop asks a hundred million questions to find
them.

## 4. Why it is not enough

Time is **O(num)**, space O(1). At \`num = 10⁸\` that is a hundred million \`%\`
operations for a single call — a few hundred milliseconds in Java, which is
already the wrong side of comfortable, and this is a problem where the judge
hands you the worst case.

The waste is not in the test, it is in the range. Look at the divisors of 28
written as the products they came from:

\`\`\`text
1 × 28    2 × 14    4 × 7
\`\`\`

**Every divisor below the square root has a partner above it**, and the partner
is free — it is \`num / d\`, a division you have already effectively performed. The
loop above walks all the way to 27 discovering 7 and 14 as separate facts, when
finding 4 already told it about 7.

![The divisor pairs of 28 meeting at its square root, with only the left side visited](diagrams/perfect-number-notes-pairs.jpg)

Green is what the loop visits, blue is what it gets for nothing, and amber is the
pair that has to be handled by hand — because its partner is \`num\` itself, which
the definition excludes. **Only the left column has to be searched**, and that
column ends at \`√28\`, about 5.29. Four turns rather than twenty-seven, and it
finds all five divisors.

The reason it ends there is a proof rather than a rule of thumb: if \`num = a × b\`
and both \`a\` and \`b\` were above \`√num\`, then \`a × b\` would be above \`num\`. So
every pair has at least one member at or below the square root, and searching
that far finds every pair exactly once.

At \`10⁸\` the square root is \`10⁴\`. **A hundred million turns become ten
thousand.**

## 5. The plan, in pseudocode

\`\`\`pseudo
checkPerfectNumber(num):

    if num <= 1:
        return false              1 has no proper divisors

    sum <- 1                      1 divides everything, and its partner is num
                                  itself, which is excluded

    for d from 2 while d × d <= num:

        if num is divisible by d:
            sum <- sum + d
            pair <- num / d

            if pair ≠ d:          a square counts its root only once
                sum <- sum + pair

    return sum = num
\`\`\`

Two lines in there are the whole difference between a correct answer and a
plausible one.

**\`sum\` starts at 1, and the loop starts at 2.** The pair \`1 × num\` is the one
pair whose upper member is excluded by the definition, so it cannot be handled by
the general rule — 1 goes in by hand and \`num\` stays out.

**\`if pair ≠ d\`.** When \`num\` is a perfect square, the middle pair is a number
times itself: 16 is 4 × 4. Adding both members of that pair counts 4 twice, and
the sum is wrong by exactly the square root.

## 6. Divisors come in pairs

\`\`\`java Perfect.java @run-perfect-number-perfect
static boolean checkPerfectNumber(int num) {

    if (num <= 1) {
        return false;
    }

    int sum = 1;

    for (int d = 2; (long) d * d <= num; d++) {

        if (num % d == 0) {
            sum = sum + d;

            int pair = num / d;

            if (pair != d) {
                sum = sum + pair;
            }
        }
    }

    return sum == num;
}
\`\`\`

\`\`\`output @run-perfect-number-perfect
checkPerfectNumber(1)        -> false
checkPerfectNumber(4)        -> false
checkPerfectNumber(6)        -> true
checkPerfectNumber(12)       -> false
checkPerfectNumber(16)       -> false
checkPerfectNumber(25)       -> false
checkPerfectNumber(28)       -> true
checkPerfectNumber(496)      -> true
checkPerfectNumber(8128)     -> true
checkPerfectNumber(33550336) -> true
\`\`\`

\`\`\`demo Perfect.java
checkPerfectNumber(1)
checkPerfectNumber(4)
checkPerfectNumber(6)
checkPerfectNumber(12)
checkPerfectNumber(16)
checkPerfectNumber(25)
checkPerfectNumber(28)
checkPerfectNumber(496)
checkPerfectNumber(8128)
checkPerfectNumber(33550336)
\`\`\`

### The code, line by line

- \`if (num <= 1) return false;\` — **now load-bearing.** \`sum\` starts at 1 below,
  so without this guard \`num = 1\` would reach \`1 == 1\` and report that 1 is
  perfect. The guard in the brute force was tidiness; here it is the fix for a
  real wrong answer.
- \`int sum = 1;\` — 1 divides every number, and its partner is \`num\` itself, which
  the definition excludes. Seeding the sum is how you take one half of that pair
  and leave the other.
- \`for (int d = 2; (long) d * d <= num; d++)\` — start at 2 because 1 is already
  counted. The condition is a square-root test written with a multiplication:
  \`d * d <= num\` is the same question as \`d <= √num\` and it is answered in exact
  integer arithmetic, where \`Math.sqrt\` answers it in floating point and can land
  on the wrong side at the boundary. **The \`(long)\` cast is not strictly needed at
  these constraints** — \`num\` stops at 10⁸ and the largest product the loop
  reaches is just past that, comfortably inside an \`int\` — but it costs nothing
  and it is the version that survives someone widening the input range. Note the
  cast is on the *operand*: \`(long) (d * d)\` would multiply as \`int\`s first and be
  the version that looks fixed and is not.
- \`if (num % d == 0)\` — the same divisibility test as before, asked ten thousand
  times instead of a hundred million.
- \`sum = sum + d;\` — the small member of the pair, the one the loop found.
- \`int pair = num / d;\` — the large member, for free. The division is exact
  because the \`%\` above just proved it.
- \`if (pair != d) sum = sum + pair;\` — **the perfect-square guard.** For
  \`num = 16\` and \`d = 4\`, \`pair\` is also 4; without this test 4 is added twice and
  the sum comes out 19 instead of 15. It is the one line that a small test set
  will not catch, because 6, 28, 496 and 8128 are none of them squares.
- \`return sum == num;\` — unchanged, and still exact integers.

## 7. Dry run of the fast version

\`num = 28\`. \`sum\` starts at 1, and the loop runs while \`d × d <= 28\`, so \`d\`
reaches 5.

| d | d × d | ≤ 28? | 28 % d | pair | sum after |
|---|---|---|---|---|---|
| start | — | — | — | — | 1 |
| 2 | 4 | yes | 0 | 14 | 1 + 2 + 14 = 17 |
| 3 | 9 | yes | 1 | — | 17 |
| 4 | 16 | yes | 0 | 7 | 17 + 4 + 7 = **28** |
| 5 | 25 | yes | 3 | — | 28 |
| 6 | 36 | **no** | — | — | loop ends |
| end | — | — | — | — | \`28 == 28\` → **true** |

**Four turns instead of twenty-seven**, and the same five divisors — 1 seeded, 2
and 14 in one turn, 4 and 7 in another.

Now \`num = 16\`, the input that exists to catch the pair guard:

| d | 16 % d | pair | pair ≠ d? | sum after |
|---|---|---|---|---|
| start | — | — | — | 1 |
| 2 | 0 | 8 | yes | 1 + 2 + 8 = 11 |
| 3 | 1 | — | — | 11 |
| 4 | 0 | **4** | **no — skip it** | 11 + 4 = **15** |
| end | — | — | — | \`15 == 16\` is false → **false** |

The proper divisors of 16 really are 1, 2, 4 and 8, and they sum to 15 — one
short, which makes 16 *deficient*. **Without the \`pair != d\` test the sum is 19**
and 16 would be reported as neither perfect nor deficient but simply wrong.

And \`num = 1\`:

| step | what happens |
|---|---|
| the guard | \`1 <= 1\` → **return false** immediately |
| without the guard | \`sum\` stays 1, loop never runs, \`1 == 1\` → **true**, wrong |

## 8. Key takeaways

- **Proper divisors exclude the number itself.** That is why the brute force
  stops at \`d < num\`, and why the fast version seeds \`sum\` with 1 rather than
  with \`1 + num\`.
- **Divisors come in pairs that meet at the square root.** Finding \`d\` gives you
  \`num / d\` for free, so searching to \`√num\` finds every divisor. A hundred
  million turns become ten thousand.
- **The square-root cut is a proof.** If both factors of \`num = a × b\` were above
  \`√num\` their product would exceed \`num\`, so every pair has a member at or below
  it.
- **\`d * d <= num\`, not \`d <= Math.sqrt(num)\`.** Integer multiplication is exact;
  a floating-point root can answer the wrong side at the boundary. Put the cast on
  the operand if you widen the range.
- **A perfect square counts its root once.** \`pair != d\` is the guard, and 16 is
  the input that finds its absence. None of 6, 28, 496 or 8128 is a square, so a
  test set of perfect numbers will never catch it.
- **1 is not perfect, and the guard becomes load-bearing** the moment \`sum\` starts
  at 1. Test it deliberately.
- **O(√num) time, O(1) space** — ten thousand turns at the top of the range.
- **There are only five perfect numbers below 10⁸**, and Euclid and Euler between
  them proved that every even one has the form \`2ᵖ⁻¹ (2ᵖ − 1)\` where \`2ᵖ − 1\` is
  prime. A hard-coded set of those five is a legitimate O(1) answer to this exact
  question — worth saying out loud, and worth writing the real loop anyway,
  because the follow-up asks for the divisor sum rather than the verdict.
`;export{e as default};