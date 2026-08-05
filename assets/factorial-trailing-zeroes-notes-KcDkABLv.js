var e=`The question says factorial, so the first instinct is to compute one. That
instinct is wrong twice over: \`n!\` overflows a \`long\` at 21, and you never needed
the number in the first place. Counting the zeros turns out not to require
knowing what they are attached to.

## 1. The problem

Given an integer \`n\`, return the number of trailing zeroes in \`n!\`.

- **In** — \`n\`, an \`int\`, and \`0 <= n <= 10⁴\`.
- **Out** — a count, as an \`int\`.
- **\`n!\`** — \`1 × 2 × 3 × … × n\`, and \`0!\` is 1 by definition.

**A trailing zero is a factor of 10.** Three zeros on the end of a number means
the number is divisible by 1000 and not by 10000 — nothing to do with how it was
written down, everything to do with how many 10s are inside it. So the question
is really *how many times does 10 divide \`n!\`*.

**Ten is 2 × 5**, and that is the entire problem in three characters. A factor of
10 needs one 2 and one 5, so the count of 10s is the smaller of the count of 2s
and the count of 5s.

**\`n\` goes to ten thousand**, and \`10000!\` is a number with 35660 digits. No
primitive type in Java holds it, and nothing on this page will try to.

## 2. The brute force

Build the factorial, then strip zeros off the end and count them.

\`\`\`java FactorialZeros.java @run-factorial-trailing-zeroes-factorial-zeros
static int trailingZeroes(int n) {

    long fact = 1;

    for (int i = 2; i <= n; i++) {
        fact = fact * i;
    }

    int count = 0;

    while (fact % 10 == 0) {
        count++;
        fact = fact / 10;
    }

    return count;
}
\`\`\`

\`\`\`output @run-factorial-trailing-zeroes-factorial-zeros
trailingZeroes(0)  -> 0
trailingZeroes(3)  -> 0
trailingZeroes(5)  -> 1
trailingZeroes(10) -> 2
trailingZeroes(20) -> 4
trailingZeroes(21) -> 0
trailingZeroes(25) -> 0
\`\`\`

\`\`\`demo FactorialZeros.java
trailingZeroes(0)
trailingZeroes(3)
trailingZeroes(5)
trailingZeroes(10)
trailingZeroes(20)
trailingZeroes(21)
trailingZeroes(25)
\`\`\`

### The code, line by line

- \`long fact = 1;\` — a \`long\` rather than an \`int\` because an \`int\` gives up at
  12! and a \`long\` at 20!. Both give up; one just does it later, which is a bad
  property in a bug.
- \`for (int i = 2; i <= n; i++)\` — starting at 2 rather than 1 because
  multiplying by 1 is not work. \`n = 0\` and \`n = 1\` run zero turns and leave
  \`fact\` at 1, which is correct: both factorials are 1.
- \`fact = fact * i;\` — **this is the line that lies.** Java does not report
  integer overflow. When the product passes \`Long.MAX_VALUE\` it wraps round to
  something negative, and the loop carries on multiplying that garbage as if
  nothing happened.
- \`while (fact % 10 == 0)\` — peel one zero at a time. \`%\` and \`/\` by 10 is how
  you ask about the last decimal digit without turning the number into a string.
- \`count++; fact = fact / 10;\` — count the zero, then remove it so the next turn
  looks at the digit behind it.
- \`return count;\` — correct for every \`n\` up to 20, and confidently wrong after
  that.

## 3. Dry run of the brute force

\`n = 10\`. The loop builds 3628800, and the peeling starts there.

| step | fact | last digit | count |
|---|---|---|---|
| built | 3628800 | 0 | 0 |
| peel | 362880 | 0 | 1 |
| peel | 36288 | **8** | 2 |
| end | 36288 | — | **2** |

Two zeros, which is right — and notice the loop stopped because it hit an 8, not
because it ran out of anything. That is what "trailing" means.

Now compare the recorded output against the true answers:

| n | true zeros | what this method returns |
|---|---|---|
| 5 | 1 | 1 |
| 10 | 2 | 2 |
| 20 | 4 | 4 |
| 21 | 4 | **0** |
| 25 | 6 | **0** |

**21 is the cliff.** 20! is 2432902008176640000, which fits a \`long\` with room to
spare; 21! is 51090942171709440000, which does not, and the wrap leaves
−4249290049419214848 in \`fact\`. That number ends in an 8, so the peeling loop
never runs even once and the answer comes back 0.

It is worth being precise about why this is the worst kind of wrong: the method
does not throw, does not slow down, and returns a plausible-looking small number.
Every test up to 20 passes.

There is a second failure hiding behind the first. Once \`n\` reaches 66, \`n!\`
contains 2⁶⁴ as a factor, so the wrapped value is exactly **0** — and \`0 % 10\` is
0 while \`0 / 10\` is 0, so the peeling loop spins forever on an unchanging number.
The method does not just return the wrong count for large \`n\`; for some inputs it
never returns at all.

## 4. Why it is not enough

Overflow is the headline, but it is not the interesting objection — someone will
suggest \`BigInteger\` and that does fix it. So price that version honestly:
\`10000!\` has 35660 digits, the multiplications get slower as the number grows,
and then you walk the decimal digits to count zeros. It would pass, slowly, and
it computes a 35660-digit number in order to report the integer 2499.

**The whole factorial is thrown away.** Only one property of it was ever wanted —
how many times 10 divides it — and that property can be worked out from \`n\`
without the product existing.

Go back to \`10 = 2 × 5\`. Each trailing zero needs one 2 and one 5 paired up, so
the count of zeros is \`min(twos, fives)\`. Count both for 10!:

| prime | where it comes from in 1 … 10 | total |
|---|---|---|
| 2 | 2, 4 (two of them), 6, 8 (three of them), 10 | 8 |
| 5 | 5, 10 | 2 |

Eight 2s and two 5s, so two pairs, so two zeros — matching the dry run above.

![The eight twos and two fives inside ten factorial, and the two pairs they can form](diagrams/factorial-trailing-zeroes-notes-pairs.jpg)

**The 2s are never the limit.** Every second number contributes a 2 and only
every fifth number contributes a 5, so 2s outnumber 5s roughly five to one for
any \`n\` worth asking about. \`min(twos, fives)\` is always \`fives\`, and half the
work disappears with that one observation: **count the fives.**

## 5. The plan, in pseudocode

Counting fives is itself not a loop over \`1 … n\`. Multiples of 5 each give one,
but 25 gives two, 125 gives three, and so on.

\`\`\`pseudo
trailingZeroes(n):

    count <- 0

    while n > 0:
        n     <- n / 5            integer division
        count <- count + n        this many numbers still have a 5 to give

    return count
\`\`\`

The trick in those three lines is that dividing \`n\` repeatedly does the whole
sum. After the first division \`n\` holds the number of multiples of 5 at or below
the original; after the second it holds the multiples of 25, which are exactly
the numbers that had a *second* 5 to give; after the third, the multiples of 125.
**Each pass collects one more 5 from the numbers rich enough to have one**, so
adding them up counts every factor of 5 exactly once, and no number is examined
individually.

Written out, the count is \`n/5 + n/25 + n/125 + …\`, and it stops on its own
because the divisions reach zero.

## 6. Counting the fives

\`\`\`java TrailingZeros.java @run-factorial-trailing-zeroes-trailing-zeros
static int trailingZeroes(int n) {

    int count = 0;

    while (n > 0) {
        n = n / 5;
        count = count + n;
    }

    return count;
}
\`\`\`

\`\`\`output @run-factorial-trailing-zeroes-trailing-zeros
trailingZeroes(0)     -> 0
trailingZeroes(3)     -> 0
trailingZeroes(5)     -> 1
trailingZeroes(10)    -> 2
trailingZeroes(20)    -> 4
trailingZeroes(21)    -> 4
trailingZeroes(25)    -> 6
trailingZeroes(100)   -> 24
trailingZeroes(10000) -> 2499
\`\`\`

\`\`\`demo TrailingZeros.java
trailingZeroes(0)
trailingZeroes(3)
trailingZeroes(5)
trailingZeroes(10)
trailingZeroes(20)
trailingZeroes(21)
trailingZeroes(25)
trailingZeroes(100)
trailingZeroes(10000)
\`\`\`

### The code, line by line

- \`int count = 0;\` — an \`int\` is plenty. The answer for the largest allowed input
  is 2499.
- \`while (n > 0)\` — **\`n\` is being consumed as the loop variable.** Reusing the
  parameter this way is fine here and it is what makes the code short; if you
  find it uncomfortable, copy it into a local first. What is not optional is that
  the condition is \`> 0\` — with \`>= 0\` the loop never ends, because \`0 / 5\` is 0.
- \`n = n / 5;\` — **divide first, add second.** The order matters. If you add
  before dividing, the first thing added is \`n\` itself rather than the count of
  multiples of 5, and every answer is far too big.
- \`count = count + n;\` — after the division \`n\` *is* the number of values at or
  below the original that still have an unclaimed 5. On the first turn that is
  the multiples of 5, on the second the multiples of 25, and so on.
- \`return count;\` — no factorial was computed, no array was allocated, and
  nothing overflowed.

There is no \`n <= 0\` guard because none is needed: the loop condition already
refuses to run, and \`0!\` and \`1!\` have no trailing zeros.

## 7. Dry run of the fast version

\`n = 100\`.

| turn | n before | n after | what n now means | count |
|---|---|---|---|---|
| 1 | 100 | 20 | 20 multiples of 5 in 1…100 | 20 |
| 2 | 20 | 4 | 4 multiples of 25, each with a second 5 | 24 |
| 3 | 4 | 0 | no multiples of 125 | 24 |
| end | 0 | — | loop stops | **24** |

Three turns, and the middle row is the one people leave out. **25, 50, 75 and 100
each contain two 5s, not one** — 100 is 4 × 25 — so a method that only counted
\`n / 5\` would answer 20 and be wrong by four.

\`n = 10000\`, the largest input, in five turns:

| turn | n | count |
|---|---|---|
| 1 | 2000 | 2000 |
| 2 | 400 | 2400 |
| 3 | 80 | 2480 |
| 4 | 16 | 2496 |
| 5 | 3 | 2499 |
| end | 0 | **2499** |

**Five turns for the whole range.** The loop divides by 5 each time, so it runs
\`log₅ n\` times — six turns would already take \`n\` past a million.

## 8. Key takeaways

- **A trailing zero is a factor of 10, and 10 is 2 × 5.** The question is not
  about digits, it is about how many times 10 divides \`n!\`.
- **Count only the fives.** 2s arrive five times as often, so the pairs are always
  limited by the 5s. \`min(twos, fives)\` is \`fives\` for every \`n\`.
- **Multiples of 25 contribute two fives, 125 three, and so on.** \`n / 5\` alone
  is the most common wrong answer, and it is wrong for the first time at \`n = 25\`.
- **\`n / 5 + n / 25 + n / 125 + …\` is written as a loop that keeps dividing.**
  After each division \`n\` is the count of numbers with one more 5 left to give.
- **Divide before you add.** Adding first counts \`n\` itself and inflates every
  answer.
- **Never build the factorial.** 21! overflows a \`long\` silently and returns 0
  where the answer is 4; from 66 upward the wrapped value is exactly 0 and the
  peeling loop never terminates. \`BigInteger\` fixes the correctness and still
  computes a 35660-digit number to report 2499.
- **O(log₅ n) time, O(1) space** — five turns at ten thousand, and it would still
  be under thirty for the largest \`long\`.
- **Test 0, 4, 5, 25 and 10000.** 4 checks the empty answer, 5 the first zero, 25
  the second-order term, and 10000 the top of the range.
`;export{e as default};