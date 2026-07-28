var e=`Every problem in this topic is a rule written in English, and your job is to
turn it into a loop. There is no data structure. There is no clever insight
waiting to be found. There is a number, and a question about the number, and the
only thing standing between the two is arithmetic you already know.

That is exactly why it is first. The rest of the sheet assumes you can take a
number apart without stopping to think about it — and if \`n % 10\` and \`n / 10\`
are not yet automatic, every later pattern will be carrying that weight as well
as its own.

Nothing below assumes anything except that you can write a \`for\` loop and print
a line.

## The two operators the whole topic runs on

Java has two operators for division, and the difference between them is the
entire topic.

- \`/\` on two \`int\`s is **integer division**. It divides and throws the remainder
  away. \`7 / 2\` is \`3\`, not \`3.5\`.
- \`%\` is the **remainder**, sometimes called modulo. \`7 % 2\` is \`1\`.

\`\`\`java
int n = 7;
int half = n / 2;        // 3   — the .5 is discarded, not rounded
int left = n % 2;        // 1   — what did not divide evenly
\`\`\`

\`\`\`expected
half = 3
left = 1
\`\`\`

Two facts follow, and between them they solve most of this topic:

**\`n % 10\` is the last digit of \`n\`.** The number 4092 is
\`4 × 1000 + 0 × 100 + 9 × 10 + 2\`, and every term except the last is a multiple
of ten. Dividing by ten leaves those terms whole and leaves the 2 over.

**\`n / 10\` is \`n\` with the last digit removed.** Same reason: the 2 does not
survive the integer division, and everything above it shifts down one place.

\`\`\`text
n = 4092    n % 10 = 2     n / 10 = 409
n = 409     n % 10 = 9     n / 10 = 40
n = 40      n % 10 = 0     n / 10 = 4
n = 4       n % 10 = 4     n / 10 = 0     <- the loop ends here
\`\`\`

Put those two lines in a loop and you have a machine that hands you the digits
of any number, right to left, and stops on its own.

![The digit loop peeling 4092 one digit at a time until it reaches zero](diagrams/coding-foundations-notes-digit-loop.jpg)

## The shape

\`\`\`java
while (n > 0) {
    int digit = n % 10;   // take the last digit
    n /= 10;              // and drop it
}
\`\`\`

Read it as a sentence: *while there is anything left, look at the last digit,
then throw it away.* \`n /= 10\` is shorthand for \`n = n / 10\`, and it is what
guarantees the loop ends — every pass makes \`n\` strictly smaller, so it must
reach zero.

Almost every digit problem is that loop with one line added inside it.

| The question | The line inside the loop |
|---|---|
| How many digits? | \`count++\` |
| What do the digits add up to? | \`sum += digit\` |
| Reverse the number | \`reversed = reversed * 10 + digit\` |
| Is any digit a 7? | \`if (digit == 7) return true\` |
| Largest digit | \`best = Math.max(best, digit)\` |

The reversal line is the only one that is not obvious, so read it slowly.
\`reversed * 10\` shifts everything already collected one place left and leaves a
zero in the ones column; \`+ digit\` fills that zero in. Starting from 0 and
feeding it 2, then 9, then 0, then 4, you get 2, then 29, then 290, then 2904.

## A first program

Here is the loop doing four jobs at once, so you can see that they really are
the same loop.

\`\`\`java Digits.java @run-coding-foundations-digits
public class Digits {

    public static void main(String[] args) {
        int original = 4092;
        int n = original;

        int count = 0;
        int sum = 0;
        int reversed = 0;
        int largest = 0;

        while (n > 0) {
            int digit = n % 10;
            n /= 10;

            count++;
            sum += digit;
            reversed = reversed * 10 + digit;
            largest = Math.max(largest, digit);
        }

        System.out.println("number    " + original);
        System.out.println("digits    " + count);
        System.out.println("sum       " + sum);
        System.out.println("reversed  " + reversed);
        System.out.println("largest   " + largest);
    }
}
\`\`\`

\`\`\`output @run-coding-foundations-digits
number    4092
digits    4
sum       15
reversed  2904
largest   9
\`\`\`

Notice \`int n = original\`. The loop destroys whatever it is given — by the end
\`n\` is zero — so if you want the number afterwards you need a second copy. That
is not a style preference. Forgetting it is the reason a printed answer says
\`0\` when you were sure the arithmetic was right.

## Zero, and the other end of the loop

\`while (n > 0)\` never runs when \`n\` is already 0. So a digit count of 0 comes
back as **0 digits**, and zero plainly has one digit.

There are two honest fixes and one dishonest one.

\`\`\`java
// 1. do-while: run the body once, then test
int count = 0;
do {
    count++;
    n /= 10;
} while (n > 0);

// 2. handle it before the loop
if (n == 0) return 1;
\`\`\`

The dishonest fix is to write \`while (n >= 0)\`, which never ends: \`0 / 10\` is
\`0\`, so \`n\` stops shrinking and the loop spins forever. If a submission of yours
ever "hangs", this is the first thing to look for.

Negatives need a decision rather than a fix, because the right answer depends on
the question. \`-4092 % 10\` in Java is \`-2\`, not \`8\` — Java's remainder takes the
sign of the left operand. Usually you want \`n = Math.abs(n)\` first and to
remember the sign separately. Be careful of one value: \`Math.abs(Integer.MIN_VALUE)\`
is still negative, because there is no positive 2147483648 in an \`int\`. Problems
that involve reversing an integer are usually testing exactly that.

## Divisors, and why the loop stops at the square root

The second half of this topic is about factors: is this number prime, is it a
perfect number, how many divisors does it have.

The naive answer tries every number from 2 up to \`n - 1\`. That is O(n) and it is
far more work than necessary, because **divisors come in pairs**. If \`d\` divides
36, so does \`36 / d\`:

\`\`\`text
36 = 1 × 36
   = 2 × 18
   = 3 × 12
   = 4 × 9
   = 6 × 6      <- the turning point, and it is exactly sqrt(36)
\`\`\`

After 6 the pairs repeat backwards — 9 × 4 is the same fact as 4 × 9. So if a
number has any divisor at all, it has one **at or below its square root**. Check
up to there and you have checked everything.

![Divisors of 36 pairing up around its square root](diagrams/coding-foundations-notes-divisor-pairs.jpg)

\`\`\`java
static boolean isPrime(int n) {
    if (n < 2) return false;
    for (int d = 2; (long) d * d <= n; d++)
        if (n % d == 0) return false;
    return true;
}
\`\`\`

Two details in that loop are worth more than they look.

**\`d * d <= n\` rather than \`d <= Math.sqrt(n)\`.** Multiplication on integers is
exact; \`Math.sqrt\` returns a \`double\` and can land a hair under the true value,
which for a perfect square is the difference between a right and a wrong answer.
Avoiding floating point when the question is about whole numbers is a habit
worth forming here, where it costs nothing.

**The cast to \`long\`.** \`d * d\` is an \`int\` multiplication, and for \`n\` near
\`Integer.MAX_VALUE\` it overflows to a negative number before it is ever compared.
The loop then never ends. Casting one side makes the arithmetic 64-bit.

That is O(√n) — for a number near two billion, about 46,000 steps instead of two
billion.

## When you want every prime up to n

Testing each number separately is O(n√n), and when a problem asks for *all* the
primes below a limit there is something much better: cross out the multiples
instead of testing the numbers. This is the **sieve of Eratosthenes**.

\`\`\`java Sieve.java @run-coding-foundations-sieve
import java.util.Arrays;

public class Sieve {

    static int countPrimes(int limit) {
        if (limit < 3) return 0;

        // composite[i] means "i has a factor other than 1 and itself"
        boolean[] composite = new boolean[limit];
        int count = 0;

        for (int p = 2; p < limit; p++) {
            if (composite[p]) continue;
            count++;
            // Start at p*p: every smaller multiple of p was already crossed
            // out by a smaller prime.
            for (long m = (long) p * p; m < limit; m += p)
                composite[(int) m] = true;
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println("primes below 30  " + countPrimes(30));
        System.out.println("primes below 100 " + countPrimes(100));

        boolean[] composite = new boolean[20];
        for (int p = 2; p * p < 20; p++)
            if (!composite[p])
                for (int m = p * p; m < 20; m += p) composite[m] = true;

        System.out.println("primes below 20  " + Arrays.toString(
                java.util.stream.IntStream.range(2, 20)
                        .filter(i -> !composite[i])
                        .toArray()));
    }
}
\`\`\`

\`\`\`output @run-coding-foundations-sieve
primes below 30  10
primes below 100 25
primes below 20  [2, 3, 5, 7, 11, 13, 17, 19]
\`\`\`

The inner loop starting at \`p * p\` is the part people get wrong. When \`p\` is 5,
the multiples 10, 15 and 20 were already struck out by 2 and 3 — the first
multiple of 5 that nothing smaller has reached is 25.

![Why the sieve starts crossing out at p times p](diagrams/coding-foundations-notes-sieve-start.jpg)

The whole thing runs in about O(n log log n), which is near enough to linear
that you should treat it as free. Reach for it the moment a problem says "up
to n" rather than "is this one prime".

## Powers, and doing them in log n

\`Math.pow\` returns a \`double\`, and a \`double\` cannot hold every large integer
exactly, so an interview answer to \`Pow(x, n)\` is expected to be written out.
The naive loop multiplies \`n\` times. **Fast exponentiation** halves the exponent
instead, using one fact:

> x^n is (x^(n/2))², and if n is odd there is one spare x left over.

\`\`\`java Power.java @run-coding-foundations-power
public class Power {

    static long power(long base, int exponent) {
        long result = 1;
        while (exponent > 0) {
            if ((exponent & 1) == 1) result *= base;   // odd: take one out
            base *= base;                              // square the base
            exponent >>= 1;                            // halve the exponent
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println("2^10  = " + power(2, 10));
        System.out.println("3^13  = " + power(3, 13));
        System.out.println("7^0   = " + power(7, 0));
        System.out.println("2^62  = " + power(2, 62));
    }
}
\`\`\`

\`\`\`output @run-coding-foundations-power
2^10  = 1024
3^13  = 1594323
7^0   = 1
2^62  = 4611686018427387904
\`\`\`

\`exponent & 1\` is "is the last bit set", which is a faster spelling of
\`exponent % 2 == 1\`. \`exponent >>= 1\` is "shift the bits right one place", which
is \`exponent /= 2\`. Both are the ordinary way this is written and you will meet
them again in [bit manipulation](#/dsa/bit-manipulation/notes).

Thirteen becomes six becomes three becomes one becomes zero — four passes rather
than thirteen. For an exponent of a billion it is thirty passes rather than a
billion.

The same halving is why *Power of Two* and *Power of Three* have neat answers:
keep dividing by the base while it divides evenly, and see whether you land on
exactly 1.

## The mistakes, in the order people make them

1. **Losing the original number.** The digit loop consumes \`n\`. Copy it first.
2. **Forgetting zero.** \`while (n > 0)\` produces nothing at all for \`n = 0\`.
   Decide what that should mean before you write the loop, not after a test
   fails.
3. **\`while (n >= 0)\`.** An infinite loop, because zero divided by ten is zero.
4. **Overflow when reversing.** Reversing 1534236469 does not fit in an \`int\`.
   Accumulate into a \`long\` and compare against \`Integer.MAX_VALUE\`, or check
   before each multiplication.
5. **\`Math.sqrt\` in a divisor loop.** Use \`d * d <= n\`, and cast to \`long\` so
   the square itself cannot overflow.
6. **\`int\` overflow in the loop condition.** \`d * d\` for large \`n\` goes negative
   and the loop runs forever, which reads as a timeout rather than a wrong
   answer, which sends you looking in the wrong place.
7. **Floating point for exact arithmetic.** \`0.1 + 0.2\` is not \`0.3\`, and
   \`Math.pow(3, 5)\` is a \`double\` that happens to print nicely. If the answer is
   a whole number, keep the whole calculation in whole numbers.

## The Java you will reach for

| You want | Write |
|---|---|
| Last digit | \`n % 10\` |
| Drop the last digit | \`n / 10\` |
| Is it even | \`(n & 1) == 0\` or \`n % 2 == 0\` |
| Digits of a number, as text | \`String.valueOf(n)\` then \`charAt(i) - '0'\` |
| Bigger, smaller | \`Math.max(a, b)\`, \`Math.min(a, b)\` |
| Absolute value | \`Math.abs(n)\` — mind \`Integer.MIN_VALUE\` |
| Largest and smallest \`int\` | \`Integer.MAX_VALUE\`, \`Integer.MIN_VALUE\` |
| Avoid overflow | do the arithmetic in \`long\`, then check the range |
| Fill an array | \`Arrays.fill(a, value)\` |
| Print an array | \`Arrays.toString(a)\` |

Converting a digit character to its value is \`c - '0'\`, because the digits sit
next to each other in the character set: \`'7' - '0'\` is 7. It is the single most
useful trick in the topic and it comes up again in every string problem.

## Working one from the sheet

**[Happy Number](problem:happy-number).** Replace the number by the sum of the squares of its digits,
repeat, and see whether you reach 1. If you do not, you loop forever.

The digit part is the loop you already have:

\`\`\`java
static int squareSum(int n) {
    int sum = 0;
    while (n > 0) {
        int d = n % 10;
        sum += d * d;
        n /= 10;
    }
    return sum;
}
\`\`\`

The only new question is how to notice a cycle without storing every number you
have seen. The trick is the same one used on linked lists: run two copies at
different speeds, one taking one step per round and one taking two. If there is
a cycle they eventually stand on the same value; if there is not, the fast one
reaches 1 first.

\`\`\`java Happy.java @run-coding-foundations-happy
public class Happy {

    static int squareSum(int n) {
        int sum = 0;
        while (n > 0) {
            int d = n % 10;
            sum += d * d;
            n /= 10;
        }
        return sum;
    }

    static boolean isHappy(int n) {
        int slow = n;
        int fast = squareSum(n);
        while (fast != 1 && slow != fast) {
            slow = squareSum(slow);
            fast = squareSum(squareSum(fast));
        }
        return fast == 1;
    }

    public static void main(String[] args) {
        for (int n : new int[] { 1, 7, 19, 2, 4, 116 })
            System.out.println(n + " -> " + isHappy(n));
    }
}
\`\`\`

\`\`\`output @run-coding-foundations-happy
1 -> true
7 -> true
19 -> true
2 -> false
4 -> false
116 -> false
\`\`\`

You have now used a digit loop, a termination argument and cycle detection in
about twenty lines, which is a fair description of what this whole topic is
for.

## How to work through the topic

Do them in this order rather than top to bottom:

1. [Fizz Buzz](problem:fizz-buzz), [Add Digits](problem:add-digits),
   [Palindrome Number](problem:palindrome-number). The digit loop, three ways.
   If any of these takes more than five minutes, stay here.
2. [Power of Two](problem:power-of-two), [Power of Three](problem:power-of-three),
   [Ugly Number](problem:ugly-number). Repeated division, and the habit of
   asking whether you land exactly on 1.
3. [Sqrt(x)](problem:sqrtx), [Pow(x, n)](problem:powx-n),
   [Divide Two Integers](problem:divide-two-integers). No floating point
   allowed. This is where you learn to think in bounds and overflow.
4. [Count Primes](problem:count-the-number-of-prime-numbers-less-than-n),
   [Factorial Trailing Zeroes](problem:factorial-trailing-zeroes). The moment
   counting beats testing. Trailing zeroes is the nicest problem here: the
   answer is how many fives are in the factorisation, and you never build the
   factorial at all.
5. [Number of Digit One](problem:number-of-digit-one),
   [Super Pow](problem:super-pow). Both are digit loops with the arithmetic
   pushed one level further. Leave them until the first four are automatic.

The measure of being done with this topic is not how many are ticked. It is
whether you can write the digit loop, the divisor loop and fast exponentiation
from memory, with the zero case and the overflow case already handled — because
every one of them turns up inside a harder problem later, where it will not be
the part you are supposed to be thinking about.
`;export{e as default};