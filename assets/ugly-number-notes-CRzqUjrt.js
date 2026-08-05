var e=`A number is **ugly** if the only primes that divide it are 2, 3 and 5. 6 is ugly
because it is 2 × 3; 14 is not, because it hides a 7. The word makes it sound
like a property you have to detect, and it is really just division done until it
stops.

## 1. The problem

Given an integer \`n\`, return \`true\` if it is an ugly number.

- **In** — \`n\`, an \`int\`, and \`−2³¹ <= n <= 2³¹ − 1\`.
- **Out** — \`boolean\`.
- **Ugly** — a **positive** integer whose prime factors are limited to 2, 3
  and 5.

Three things are decided before any code is written.

**\`n\` must be positive.** Zero and every negative number are not ugly, and the
range includes both — so a guard is unavoidable here in a way it is not on most
of these problems.

**1 is ugly.** It is the empty product: it has no prime factors at all, so it
trivially has none outside 2, 3 and 5. It is the answer most people get wrong on
first attempt, and it is why the final test is \`n == 1\` rather than something
about factors.

**"Limited to" does not mean "contains".** 8 is ugly (2 × 2 × 2) even though it
has no 3 and no 5. The question is only whether anything *else* is in there.

## 2. The plan, in pseudocode

\`\`\`pseudo
isUgly(n):

    if n <= 0:
        return false                  zero and negatives are never ugly

    for each factor in 2, 3, 5:
        while n is divisible by factor:
            n <- n / factor           take that factor out entirely

    return n = 1                      1 means nothing else was left
\`\`\`

The whole idea is in the last line. **Divide out everything you are allowed to
have, and look at what survives.** If the leftover is 1, the number was built
only from 2s, 3s and 5s. If it is anything else, that leftover *is* the forbidden
factor — and you do not need to know which prime it is to reject it.

## 3. The brute force

\`\`\`java Ugly.java @run-ugly-number-ugly
static boolean isUgly(int n) {

    if (n <= 0) {
        return false;
    }

    int[] factors = { 2, 3, 5 };

    for (int factor : factors) {
        while (n % factor == 0) {
            n = n / factor;
        }
    }

    return n == 1;
}
\`\`\`

\`\`\`output @run-ugly-number-ugly
isUgly(1)          -> true
isUgly(6)          -> true
isUgly(8)          -> true
isUgly(30)         -> true
isUgly(14)         -> false
isUgly(0)          -> false
isUgly(-6)         -> false
isUgly(2147483647) -> false
\`\`\`

\`\`\`demo Ugly.java
isUgly(1)
isUgly(6)
isUgly(8)
isUgly(30)
isUgly(14)
isUgly(0)
isUgly(-6)
isUgly(2147483647)
\`\`\`

### The code, line by line

- \`if (n <= 0) return false;\` — both halves matter. **Negative numbers** are
  excluded by the definition. **Zero** would be worse than wrong: \`0 % 2\` is 0
  and \`0 / 2\` is 0, so the inner loop would spin forever on an unchanging number.
- \`int[] factors = { 2, 3, 5 };\` — the three allowed primes, written once. Three
  copy-pasted \`while\` loops would work identically; the array is there so the
  set of factors is stated in one place rather than three.
- \`while (n % factor == 0)\` — **\`while\`, not \`if\`.** A factor can appear many
  times: 8 is 2 × 2 × 2, so one division is not enough. This is the single most
  common mistake on the problem, and it fails only on inputs with a repeated
  factor — 6 passes, 8 does not.
- \`n = n / factor;\` — exact, because the condition just proved \`n\` is divisible.
- \`return n == 1;\` — the leftover. **Not \`n == 0\`**, which never happens, and not
  a check against the factor list.

## 4. Dry run of the brute force

\`n = 30\`, which is ugly, and \`n = 14\`, which is not.

| factor | n before | divides? | n after |
|---|---|---|---|
| 2 | 30 | yes | 15 |
| 2 | 15 | no | 15 |
| 3 | 15 | yes | 5 |
| 3 | 5 | no | 5 |
| 5 | 5 | yes | 1 |
| 5 | 1 | no | 1 |
| — | — | — | \`1 == 1\` → **true** |

| factor | n before | divides? | n after |
|---|---|---|---|
| 2 | 14 | yes | 7 |
| 2 | 7 | no | 7 |
| 3 | 7 | no | 7 |
| 5 | 7 | no | 7 |
| — | — | — | \`7 == 1\` is false → **false** |

The two side by side. Green is a factor being removed, amber is the leftover that
decides the answer:

![4. Dry run of the brute force — diagram](diagrams/ugly-number-notes-mm-1.jpg)

**The method never learns that 7 is prime, and never needs to.** It removed
everything it was allowed to remove, and something was still there. That is
enough to reject, and it is why the answer is one comparison rather than a
primality test.

Now \`n = 8\`, the input that catches \`if\` instead of \`while\`:

| factor | n before | divides? | n after |
|---|---|---|---|
| 2 | 8 | yes | 4 |
| 2 | 4 | yes | 2 |
| 2 | 2 | yes | 1 |
| 3, 5 | 1 | no | 1 |
| — | — | — | **true** |

Three divisions by the same factor. **With \`if\` in place of \`while\`, this stops
at 4 and returns \`false\`** — and 6, 10, 15 and 30 would all still be right, so
the mistake survives casual testing.

And \`n = 1\`:

| factor | n before | divides? | n after |
|---|---|---|---|
| 2, 3, 5 | 1 | no | 1 |
| — | — | — | \`1 == 1\` → **true** |

No loop body runs at all. **1 is ugly**, and it falls out of the code rather than
needing a case.

## 5. Why it is not enough

It is enough, and it is close to optimal. Each division at least halves the
number, so there are at most \`log₂ n\` of them — about 31 for the largest \`int\`.
**O(log n) time, O(1) space.**

The only thing left is that the three loops are three passes where one would do,
and that a \`%\` and a \`/\` on the same pair is work the machine can do once. Both
are micro-detail rather than a different algorithm, and neither changes the
complexity.

What *does* change with a follow-up is the question. This problem asks "is this
number ugly". The next one asks **"give me the nth ugly number"**, and that is a
genuinely different problem: testing each integer in turn is far too slow,
because ugly numbers thin out fast. The answer there is to *generate* them
instead — keep three pointers into the list you are building, multiply by 2, 3
and 5, and always take the smallest next value. Nothing on this page helps with
it, which is worth knowing before you are asked.

## 6. Key takeaways

- **Divide out what is allowed and look at the leftover.** If 1 survives, nothing
  forbidden was in there. You never have to identify the offending prime.
- **\`while\`, not \`if\`.** A factor can repeat — 8 is three 2s — and this is the
  mistake that passes 6, 10, 15 and 30 before failing on 8.
- **1 is ugly.** It has no prime factors, so none of them are outside the allowed
  set. \`n == 1\` is the check, and it handles this for free.
- **Guard \`n <= 0\`.** Negatives are excluded by definition, and zero would spin
  the inner loop forever because \`0 / 2\` is 0.
- **"Limited to 2, 3 and 5" is not "contains 2, 3 and 5".** 8 is ugly.
- **O(log n)** — every division at least halves \`n\`, so at most about 31 of them.
- **The follow-up is a different problem.** "The nth ugly number" is generated,
  not tested.
`;export{e as default};