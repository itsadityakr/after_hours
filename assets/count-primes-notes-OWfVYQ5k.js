var e=`Count the primes below \`n\`. The definition gives you a program in six lines, and
that program is far too slow at the top of the constraints. The fix is not a
faster primality test — it is asking the question the other way round.

## 1. The problem

Given an integer \`n\`, return how many primes are **strictly less than** \`n\`.

- **In** — \`n\`, an \`int\`, and \`0 <= n <= 5 × 10⁶\`.
- **Out** — a count, as an \`int\`.
- **Prime** — a whole number above 1 whose only divisors are 1 and itself.

**Strictly less than** is the trap: \`countPrimes(2)\` is 0, not 1, and \`n\` itself
is never tested. \`n\` can also be 0 or 1, so the smallest inputs are a guard
rather than a calculation.

Five million decides the approach. It is small enough to hold that many booleans
— about five megabytes — and far too large to ask five million separate
questions about divisibility.

## 2. The brute force

The definition, with the square-root cut already applied: if \`k = a × b\` and both
factors were above \`√k\`, their product would exceed \`k\`. So any composite has a
divisor at or below its square root.

\`\`\`java PrimesTrial.java @run-count-primes-primes-trial
static long divisions = 0;

static boolean isPrime(int k) {

    if (k < 2) {
        return false;
    }

    for (int d = 2; (long) d * d <= k; d++) {
        divisions++;

        if (k % d == 0) {
            return false;
        }
    }

    return true;
}

static int countPrimes(int n) {

    int count = 0;

    for (int i = 2; i < n; i++) {
        if (isPrime(i)) {
            count++;
        }
    }

    return count;
}

static long divisionsFor(int n) {
    divisions = 0;
    countPrimes(n);
    return divisions;
}
\`\`\`

\`\`\`output @run-count-primes-primes-trial
countPrimes(0)       -> 0
countPrimes(2)       -> 0
countPrimes(10)      -> 4
countPrimes(100)     -> 25
divisionsFor(10)     -> 7
divisionsFor(1000)   -> 5287
divisionsFor(10000)  -> 117526
divisionsFor(100000) -> 2745693
\`\`\`

\`\`\`demo PrimesTrial.java
countPrimes(0)
countPrimes(2)
countPrimes(10)
countPrimes(100)
divisionsFor(10)
divisionsFor(1000)
divisionsFor(10000)
divisionsFor(100000)
\`\`\`

## 3. Dry run of the brute force

\`n = 10\`, so the loop tests 2 through 9. One row per number, and the divisor
column lists every \`%\` the method actually performs.

| k | divisors tried | why it stopped | verdict | running count |
|---|---|---|---|---|
| 2 | none | \`2 × 2\` is already past 2, loop never runs | prime | 1 |
| 3 | none | \`2 × 2\` is past 3 | prime | 2 |
| 4 | 2 | \`4 % 2\` is 0 | composite | 2 |
| 5 | 2 | \`5 % 2\` is 1, then \`3 × 3\` is past 5 | prime | 3 |
| 6 | 2 | \`6 % 2\` is 0 | composite | 3 |
| 7 | 2 | \`7 % 2\` is 1, then \`3 × 3\` is past 7 | prime | 4 |
| 8 | 2 | \`8 % 2\` is 0 | composite | 4 |
| 9 | 2, 3 | \`9 % 2\` is 1, then \`9 % 3\` is 0 | composite | 4 |

Seven divisions, four primes. Laid out as work per number:

![3. Dry run of the brute force — diagram](diagrams/count-primes-notes-mm-1.jpg)

Green is prime, amber composite, and the row under it is what each one cost.
**Every column is computed from scratch** — 4, 6 and 8 each rediscover that 2
divides them, and nothing carries from one column to the next.

**The primes are the expensive columns.** A composite usually exits on the first
divisor; a prime must run all the way to \`√k\` to prove that nothing divides it.
As \`n\` grows the primes set the cost, and they do not thin out fast enough to
help.

**Every column starts from nothing.** Columns 4, 6 and 8 each rediscover,
separately, that 2 divides them.

## 4. Why it is not enough

The total is on the order of **n √n**. Read the counter in the output above: ten
times the \`n\` costs about twenty-three times the divisions, which is what \`n √n\`
looks like from outside. At five million that projects to roughly ten billion
divisions.

The waste is not inside any one test — it is that **the tests do not talk to each
other**. Testing 94 divides by 2 and stops; testing 96 divides by 2 and stops. It
discovers that 2 divides even numbers two and a half million times over, and
throws the fact away each time.

**Turn the question round and every fact gets used once.** Instead of asking each
number *who divides you*, take each prime and mark *what it divides*: take 2, and
cross off 4, 6, 8, 10 … in a single sweep; then 3, and cross off 9, 15, 21 …
Nothing is ever tested for primality. Things are only ever crossed off, and
whatever is still standing at the end is prime.

The work then stops being "per number, the cost of testing it" and becomes "per
prime, the count of its multiples":

\`\`\`text
n/2  +  n/3  +  n/5  +  n/7  +  n/11  + …
\`\`\`

That sum grows barely faster than \`n\` itself — it is \`n log log n\`, and
\`log log n\` is under 4 for any \`n\` a computer will ever be handed. Against
\`n √n\`, at five million, that is the difference between ten billion operations
and something in the tens of millions.

It costs an array of \`n\` flags, which is the trade: **time for memory.** That
array is also what the next follow-up attacks, and the answers are "sieve only
the odd numbers" and "sieve one cache-sized window at a time".

## 5. Key takeaways

- **The square-root cut is a proof, not a heuristic.** If \`k = a × b\` and both
  factors were above \`√k\`, their product would exceed \`k\` — so a loop that
  reaches \`√k\` without finding a divisor has *proved* primality.
- **Remember it is strictly less than \`n\`.** \`countPrimes(2)\` is 0 and
  \`countPrimes(3)\` is 1. Reading that as "up to and including \`n\`" is the most
  common wrong submission.
- **\`(long) d * d <= k\`, not \`d <= Math.sqrt(k)\`.** Integer multiplication is
  exact; a floating-point square root is not, and at the boundary it can answer
  the wrong side.
- **The primes are what it costs.** Composites usually exit on the first divisor;
  a prime runs the loop all the way, and there are enough primes that they set
  the total.
- **O(n √n) — about ten billion divisions at five million.** That is not a
  constant factor away from passing, it is the wrong shape.
- **The waste is that the tests do not talk to each other.** Testing 94 and 96
  each rediscover that 2 divides them, from scratch, two and a half million times
  over. Turning that round — each prime striking its own multiples in one sweep —
  is where the next version comes from.
`;export{e as default};