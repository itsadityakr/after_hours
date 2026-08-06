var e=`Division without \`/\`, \`*\` or \`%\` is repeated subtraction, and repeated
subtraction is two billion turns at the top of the range. The fix is to stop
subtracting the divisor and start subtracting doubles of it — and then the two
edges of a signed 32-bit int are the whole remaining problem.

## 1. The problem

Given two integers \`dividend\` and \`divisor\`, return the quotient with the
fractional part thrown away.

- **In** — \`dividend\` and \`divisor\`, both \`int\`, and \`divisor != 0\`.
- **Out** — the quotient, truncated **toward zero**, as an \`int\`.
- **Not allowed** — the multiplication, division and remainder operators.
- **Overflow** — if the true quotient is outside \`[−2³¹, 2³¹ − 1]\`, return
  \`2³¹ − 1\`.

\`\`\`text
divide(10, 3)   ->  3      not 3.33, and not 4
divide(7, -3)   -> -2      toward zero, so -2 and not -3
divide(-7, 3)   -> -2
divide(-7, -3)  ->  2
\`\`\`

Three things in that list do all the damage.

**"Toward zero" is not "round down".** For a negative quotient the two disagree:
−2.33 truncates to −2 and floors to −3. Working in magnitudes and putting the
sign on at the end gets truncation for free, which is the main reason the code
below is shaped the way it is.

**There is exactly one overflow, and it is not a family of them.** The quotient
of two \`int\`s only escapes the \`int\` range when the dividend is \`−2³¹\` and the
divisor is \`−1\`, because \`2³¹\` is one past \`Integer.MAX_VALUE\`. Every other pair
has an answer that fits. So this is one guard at the top, not a check inside the
loop.

**\`Math.abs\` cannot make \`Integer.MIN_VALUE\` positive.** There is no \`+2³¹\` in an
\`int\`, so \`Math.abs(-2147483648)\` returns \`-2147483648\` — no exception, no
warning. Widening to \`long\` *before* taking the absolute value is the fix, and
the cast has to be on the argument: \`Math.abs((long) dividend)\`.

Shifting is not on the forbidden list, and \`<<\` is where the fast version's
multiplication is going to hide.

## 2. The brute force

Take the divisor away until it no longer fits, and count.

\`\`\`java DivideScan.java @run-divide-two-integers-divide-scan
static int divide(int dividend, int divisor) {

    if (dividend == Integer.MIN_VALUE && divisor == -1) {
        return Integer.MAX_VALUE;
    }

    long a = Math.abs((long) dividend);
    long b = Math.abs((long) divisor);

    int ans = 0;

    while (a >= b) {
        a -= b;
        ans++;
    }

    if ((dividend < 0) ^ (divisor < 0)) {
        ans = -ans;
    }

    return ans;
}

static long subtractions(int dividend, int divisor) {

    long a = Math.abs((long) dividend);
    long b = Math.abs((long) divisor);
    long n = 0;

    while (a >= b) {
        a -= b;
        n++;
    }

    return n;
}

static int brokenAbs(int dividend) {
    return Math.abs(dividend);
}
\`\`\`

\`\`\`output @run-divide-two-integers-divide-scan
divide(10, 3)               -> 3
divide(7, -3)               -> -2
divide(-7, 3)               -> -2
divide(-7, -3)              -> 2
divide(-2147483648, -1)     -> 2147483647
subtractions(10, 3)         -> 3
subtractions(1000000, 1)    -> 1000000
subtractions(2147483647, 1) -> 2147483647
brokenAbs(-2147483648)      -> -2147483648
\`\`\`

\`\`\`demo DivideScan.java
divide(10, 3)
divide(7, -3)
divide(-7, 3)
divide(-7, -3)
divide(-2147483648, -1)
subtractions(10, 3)
subtractions(1000000, 1)
subtractions(2147483647, 1)
brokenAbs(-2147483648)
\`\`\`

### The code, line by line

- \`if (dividend == Integer.MIN_VALUE && divisor == -1)\` — **the one overflow,
  handled before anything else touches it.** It has to be first: the very next
  line would otherwise have to produce \`+2³¹\` as an answer, and there is nowhere
  for that to go.
- \`long a = Math.abs((long) dividend);\` — **widen, then negate.** Read
  \`brokenAbs(-2147483648)\` in the output above: \`Math.abs\` on an \`int\` hands the
  same negative number straight back. In a \`long\` there is room for 2147483648,
  so the cast is what makes the absolute value true.
- \`long b = Math.abs((long) divisor);\` — the same, and for the same reason. The
  divisor can be \`−2³¹\` too.
- \`int ans = 0;\` — the count. From here down the method only knows about
  magnitudes, and a magnitude is never negative, so the loop needs no sign logic.
- \`while (a >= b)\` — \`>=\`, so a divisor that fits exactly is counted. \`divide(3,
  3)\` has to be 1, not 0.
- \`a -= b; ans++;\` — one whole divisor removed, one added to the quotient. **This
  is the line that runs two billion times.**
- \`if ((dividend < 0) ^ (divisor < 0))\` — exclusive-or on two booleans reads as
  "one of them was negative, but not both", which is exactly when a quotient is
  negative. The signs are read from the **original** arguments, because \`a\` and
  \`b\` have had theirs removed.
- \`ans = -ans;\` — the sign, applied once at the end, and this is where truncation
  toward zero comes from. The loop rounded a positive magnitude down; negating
  afterwards moves it back toward zero rather than away from it.
- \`subtractions\` and \`brokenAbs\` are not part of the answer. One puts the cost on
  screen, the other puts the \`Math.abs\` trap on screen.

## 3. Dry run of the brute force

\`divide(10, 3)\`. The guard does nothing, \`a\` is 10 and \`b\` is 3.

| turn | a before | a >= b | a after | ans |
|---|---|---|---|---|
| 1 | 10 | yes | 7 | 1 |
| 2 | 7 | yes | 4 | 2 |
| 3 | 4 | yes | 1 | 3 |
| end | 1 | **no** | 1 | **3** |

Three turns, and the 1 left in \`a\` is the remainder nobody asked for.

Now \`divide(7, -3)\`, where the sign is the only difference:

| step | a | b | ans | note |
|---|---|---|---|---|
| start | 7 | 3 | 0 | both magnitudes, signs set aside |
| turn 1 | 4 | 3 | 1 | |
| turn 2 | 1 | 3 | 2 | 1 < 3, loop ends |
| sign | — | — | **−2** | \`false ^ true\` is true |

**−2, not −3.** The loop counted 2 whole threes out of 7 and negating that at the
end is what "toward zero" means. A version that worked in negatives throughout
would have had to say so deliberately.

And \`divide(-2147483648, -1)\`, which never reaches the loop:

| step | what happens |
|---|---|
| the guard | both conditions true, \`return Integer.MAX_VALUE\` |
| everything else | never runs |

The true answer is 2147483648. The problem statement says to return 2147483647
instead, so this is not a bug being papered over — it is the specified answer.

## 4. Why it is not enough

Time is **O(quotient)** — one turn per unit of the answer — and space is O(1).
That is not a function of the number of digits, it is a function of the value,
which is what makes it hopeless. Read the counter in the output above:
**\`subtractions(2147483647, 1)\` is 2147483647 turns.** One call. At a few hundred
million simple operations a second that is several seconds, and the time limit is
nowhere near it.

The waste is visible if you write out what the loop actually removes from 10:

\`\`\`text
3   3   3          three separate subtractions, each of the same size
\`\`\`

It never learns anything. Having subtracted 3 once, it knows 3 fits — but not
that 6 fits, or 12, even though those follow from it for free. **Doubling is
free: \`b + b\` is \`b << 1\`, and one shift buys what the loop was spending two
turns to discover.**

So take the biggest double of the divisor that still fits, remove that in one
step, and repeat with what is left:

\`\`\`text
3   6   12          the ladder, built by shifting
                    12 is too big for 10, so take 6 — that is two threes at once
\`\`\`

The number of doubles is the number of times you can halve the dividend, so the
work drops from *the size of the quotient* to *the number of bits in it*. Against
2147483647 turns, that is **31**.

It is the same trade [Pow(x, n)](problem:powx-n) makes, one operator down:
squaring is to multiplication what doubling is to addition, and both turn a count
of units into a count of bits.

## 5. The plan, in pseudocode

\`\`\`pseudo
divide(dividend, divisor):

    if dividend = MIN_VALUE and divisor = -1:
        return MAX_VALUE                  the one answer that does not fit

    a   <- |dividend|, as a long          widen before negating
    b   <- |divisor|,  as a long
    ans <- 0

    while a >= b:

        shift <- 0
        while a >= b shifted left by (shift + 1):
            shift <- shift + 1            find the biggest double that still fits

        ans <- ans + (1 shifted left by shift)
        a   <- a - (b shifted left by shift)

    if exactly one of dividend, divisor was negative:
        ans <- -ans

    return ans
\`\`\`

Two loops, and it helps to say what each one is for. **The inner loop climbs the
ladder** — \`b\`, \`2b\`, \`4b\`, \`8b\` — and stops one rung before overshooting. **The
outer loop takes that rung off and starts again** with the remainder.

The pairing on those two middle lines is the part to get right: the amount
removed from \`a\` is \`b << shift\`, and the amount added to \`ans\` is \`1 << shift\`.
They move together because \`b << shift\` *is* \`b\` counted \`1 << shift\` times.

Note what the inner loop tests: \`shift + 1\`, not \`shift\`. It is asking "would the
*next* rung still fit?" and stepping up only if the answer is yes, so it can
never leave \`shift\` pointing at a rung larger than \`a\`.

## 6. Doubling the divisor

\`\`\`java Divide.java @run-divide-two-integers-divide
static int divide(int dividend, int divisor) {

    // Overflow case
    if (dividend == Integer.MIN_VALUE && divisor == -1) {
        return Integer.MAX_VALUE;
    }

    long a = Math.abs((long) dividend);
    long b = Math.abs((long) divisor);

    int ans = 0;

    while (a >= b) {

        int shift = 0;

        while (a >= (b << (shift + 1))) {
            shift++;
        }

        ans += (1 << shift);
        a -= (b << shift);
    }

    // Apply sign
    if ((dividend < 0) ^ (divisor < 0)) {
        ans = -ans;
    }

    return ans;
}

static int turns(int dividend, int divisor) {

    if (dividend == Integer.MIN_VALUE && divisor == -1) {
        return 0;
    }

    long a = Math.abs((long) dividend);
    long b = Math.abs((long) divisor);
    int t = 0;

    while (a >= b) {

        int shift = 0;

        while (a >= (b << (shift + 1))) {
            shift++;
        }

        a -= (b << shift);
        t++;
    }

    return t;
}
\`\`\`

\`\`\`output @run-divide-two-integers-divide
divide(10, 3)           -> 3
divide(7, -3)           -> -2
divide(-7, 3)           -> -2
divide(-7, -3)          -> 2
divide(1, 1)            -> 1
divide(-2147483648, -1) -> 2147483647
divide(-2147483648, 1)  -> -2147483648
divide(-2147483648, -2) -> 1073741824
divide(2147483647, 1)   -> 2147483647
turns(10, 3)            -> 2
turns(2147483647, 1)    -> 31
turns(-2147483648, 1)   -> 1
\`\`\`

\`\`\`demo Divide.java
divide(10, 3)
divide(7, -3)
divide(-7, 3)
divide(-7, -3)
divide(1, 1)
divide(-2147483648, -1)
divide(-2147483648, 1)
divide(-2147483648, -2)
divide(2147483647, 1)
turns(10, 3)
turns(2147483647, 1)
turns(-2147483648, 1)
\`\`\`

### The code, line by line

- The guard and the two \`Math.abs((long) …)\` lines are **unchanged from the brute
  force, and for unchanged reasons.** Making the loop faster does not make \`−2³¹\`
  fit anywhere it did not fit before.
- \`while (a >= b)\` — the outer loop. One turn per rung actually used, which is one
  turn per set bit of the quotient.
- \`int shift = 0;\` — **reset every outer turn.** Carrying it over from the last
  turn would start the climb above where the remainder can support, and the
  subtraction would run \`a\` negative.
- \`while (a >= (b << (shift + 1))) { shift++; }\` — the climb, and the \`+ 1\` is the
  whole of it. It asks whether the *next* double would still fit and only then
  moves up, so on exit \`b << shift\` fits and \`b << (shift + 1)\` does not.
  **\`b\` is a \`long\`, so this shift has room** — \`b << 31\` on an \`int\` would be
  negative and the comparison would be nonsense.
- \`ans += (1 << shift);\` — \`b << shift\` is \`b\` taken \`2^shift\` times, and
  \`1 << shift\` is that count. The two lines are one operation written twice.
- \`a -= (b << shift);\` — remove the rung. \`a\` strictly decreases every outer turn
  because \`b\` is at least 1, so the loop always ends.
- \`if ((dividend < 0) ^ (divisor < 0)) { ans = -ans; }\` — the sign, once, from the
  original arguments.

**One line here is worth an argument, and it is \`ans += (1 << shift)\`.** \`ans\` is
an \`int\`, and \`shift\` can reach 31, where \`1 << 31\` is \`Integer.MIN_VALUE\` — a
negative number added to a running total that is supposed to be positive.

It is safe, for one reason: \`shift\` reaches 31 only when \`a >= b << 31\`, which
with \`a\` at most \`2³¹\` means \`b\` is 1 and \`a\` is exactly \`2³¹\`. That is
\`divide(Integer.MIN_VALUE, 1)\` and nothing else. There, the outer loop runs once,
\`ans\` goes from 0 to \`−2147483648\`, and the sign flip negates it — which for
\`Integer.MIN_VALUE\` gives back \`Integer.MIN_VALUE\`, the correct answer. Read
\`divide(-2147483648, 1)\` in the output above: it is right, and it is right by
travelling through an overflow and back.

Accumulating into a \`long\` and casting once at the end is the version that does
not need that paragraph. Both pass; only one of them can be defended in a
sentence.

## 7. Dry run of the fast version

\`divide(10, 3)\`. The inner loop's climb is shown as its own column.

| outer turn | a | ladder tried | shift | ans += | a -= | a after | ans |
|---|---|---|---|---|---|---|---|
| 1 | 10 | 3, 6 fit · 12 does not | 1 | 2 | 6 | 4 | 2 |
| 2 | 4 | 3 fits · 6 does not | 0 | 1 | 3 | 1 | 3 |
| end | 1 | 1 < 3, stop | — | — | — | 1 | **3** |

Two outer turns where the brute force took three, and the gap is only this small
because 10 is small.

![The doubling ladder for 10 divided by 3, with the rung that overshoots left untaken](diagrams/divide-two-integers-notes-ladder.jpg)

Green is the rung the climb settled on, red is the one that overshot and stopped
it, and blue is the pair of lines that fire once per outer turn. **Each rung is
one shift from the one above it** — that is the entire saving, drawn.

The grey box between the two blue ones is worth a second look: the ladder is not
kept between turns. It is rebuilt from \`b\` every time, which is what \`int shift =
0;\` inside the outer loop is doing.

Read \`turns(2147483647, 1)\` in the output above: **31 outer turns**, against
2147483647 subtractions for the same call. And \`turns(-2147483648, 1)\` is **1** —
the quotient is a single power of two, so a single rung covers all of it.

Now the three inputs at the edges, side by side:

| call | what happens | result |
|---|---|---|
| \`divide(-2147483648, -1)\` | the guard fires before anything else | 2147483647, as specified |
| \`divide(-2147483648, 1)\` | \`shift\` reaches 31, \`ans\` goes negative, the sign flip brings it back | −2147483648 |
| \`divide(-2147483648, -2)\` | \`a\` is 2³¹, \`b\` is 2, \`shift\` reaches 30, both negative so no flip | 1073741824 |

The middle row is the one to be able to talk about. The bottom row is the check
that the middle row was not luck across the board: with \`b\` at 2 the shift stops
at 30, \`1 << 30\` is an ordinary positive number, and nothing unusual happens at
all.

## 8. Key takeaways

- **Repeated subtraction is O(quotient), not O(digits).** \`2147483647 / 1\` is two
  billion turns. Doubling the divisor makes it O(log quotient) — 31.
- **\`b << shift\` removed pairs with \`1 << shift\` added.** Those two lines have to
  move together; that pairing is the whole algorithm and everything else is
  bookkeeping.
- **Test \`shift + 1\`, not \`shift\`.** The climb asks whether the next rung would
  still fit, so it can never leave a rung larger than what is left.
- **Reset \`shift\` on every outer turn.** Kept from the previous turn it starts
  above the remainder and drives \`a\` negative.
- **Widen before you take the absolute value.** \`Math.abs(Integer.MIN_VALUE)\` is
  \`Integer.MIN_VALUE\`. \`Math.abs((long) dividend)\` is the fix, and the cast
  belongs on the argument.
- **Shift in a \`long\`.** \`b << 31\` on an \`int\` is negative, and a comparison
  against a negative bound is not the comparison you wrote.
- **There is exactly one overflowing quotient**, \`−2³¹ / −1\`, and the statement
  tells you what to return for it. One guard at the top, no checking inside the
  loop.
- **Signs off at the start, back on at the end.** Working in magnitudes gives
  truncation toward zero for free; \`^\` on the two sign tests reads as "one, but
  not both".
- **O(log n) time, O(1) space.** The recursive form — divide, then halve — is the
  same algorithm with a stack under it.
- **Test \`10 / 3\`, \`7 / −3\`, \`−2³¹ / −1\`, \`−2³¹ / 1\` and \`−2³¹ / −2\`.** The last
  three are where submissions die.
`;export{e as default};