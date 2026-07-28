var e=`Every problem in this topic is a rule written in English, and your job is to\r
turn it into a loop. There is no data structure. There is no clever insight\r
waiting to be found. There is a number, and a question about the number, and the\r
only thing standing between the two is arithmetic you already know.\r
\r
That is exactly why it is first. The rest of the sheet assumes you can take a\r
number apart without stopping to think about it — and if \`n % 10\` and \`n / 10\`\r
are not yet automatic, every later pattern will be carrying that weight as well\r
as its own.\r
\r
Nothing below assumes anything except that you can write a \`for\` loop and print\r
a line.\r
\r
## The two operators the whole topic runs on\r
\r
Java has two operators for division, and the difference between them is the\r
entire topic.\r
\r
- \`/\` on two \`int\`s is **integer division**. It divides and throws the remainder\r
  away. \`7 / 2\` is \`3\`, not \`3.5\`.\r
- \`%\` is the **remainder**, sometimes called modulo. \`7 % 2\` is \`1\`.\r
\r
\`\`\`java\r
int n = 7;\r
int half = n / 2;        // 3   — the .5 is discarded, not rounded\r
int left = n % 2;        // 1   — what did not divide evenly\r
\`\`\`\r
\r
\`\`\`expected\r
half = 3\r
left = 1\r
\`\`\`\r
\r
Two facts follow, and between them they solve most of this topic:\r
\r
**\`n % 10\` is the last digit of \`n\`.** The number 4092 is\r
\`4 × 1000 + 0 × 100 + 9 × 10 + 2\`, and every term except the last is a multiple\r
of ten. Dividing by ten leaves those terms whole and leaves the 2 over.\r
\r
**\`n / 10\` is \`n\` with the last digit removed.** Same reason: the 2 does not\r
survive the integer division, and everything above it shifts down one place.\r
\r
\`\`\`text\r
n = 4092    n % 10 = 2     n / 10 = 409\r
n = 409     n % 10 = 9     n / 10 = 40\r
n = 40      n % 10 = 0     n / 10 = 4\r
n = 4       n % 10 = 4     n / 10 = 0     <- the loop ends here\r
\`\`\`\r
\r
Put those two lines in a loop and you have a machine that hands you the digits\r
of any number, right to left, and stops on its own.\r
\r
![The digit loop peeling 4092 one digit at a time until it reaches zero](diagrams/coding-foundations-notes-digit-loop.jpg)\r
\r
## The shape\r
\r
\`\`\`java\r
while (n > 0) {\r
    int digit = n % 10;   // take the last digit\r
    n /= 10;              // and drop it\r
}\r
\`\`\`\r
\r
Read it as a sentence: *while there is anything left, look at the last digit,\r
then throw it away.* \`n /= 10\` is shorthand for \`n = n / 10\`, and it is what\r
guarantees the loop ends — every pass makes \`n\` strictly smaller, so it must\r
reach zero.\r
\r
Almost every digit problem is that loop with one line added inside it.\r
\r
| The question | The line inside the loop |\r
|---|---|\r
| How many digits? | \`count++\` |\r
| What do the digits add up to? | \`sum += digit\` |\r
| Reverse the number | \`reversed = reversed * 10 + digit\` |\r
| Is any digit a 7? | \`if (digit == 7) return true\` |\r
| Largest digit | \`best = Math.max(best, digit)\` |\r
\r
The reversal line is the only one that is not obvious, so read it slowly.\r
\`reversed * 10\` shifts everything already collected one place left and leaves a\r
zero in the ones column; \`+ digit\` fills that zero in. Starting from 0 and\r
feeding it 2, then 9, then 0, then 4, you get 2, then 29, then 290, then 2904.\r
\r
## A first program\r
\r
Here is the loop doing four jobs at once, so you can see that they really are\r
the same loop.\r
\r
\`\`\`java Digits.java @run-coding-foundations-digits\r
public class Digits {\r
\r
    public static void main(String[] args) {\r
        int original = 4092;\r
        int n = original;\r
\r
        int count = 0;\r
        int sum = 0;\r
        int reversed = 0;\r
        int largest = 0;\r
\r
        while (n > 0) {\r
            int digit = n % 10;\r
            n /= 10;\r
\r
            count++;\r
            sum += digit;\r
            reversed = reversed * 10 + digit;\r
            largest = Math.max(largest, digit);\r
        }\r
\r
        System.out.println("number    " + original);\r
        System.out.println("digits    " + count);\r
        System.out.println("sum       " + sum);\r
        System.out.println("reversed  " + reversed);\r
        System.out.println("largest   " + largest);\r
    }\r
}\r
\`\`\`\r
\r
\`\`\`output @run-coding-foundations-digits\r
number    4092\r
digits    4\r
sum       15\r
reversed  2904\r
largest   9\r
\`\`\`\r
\r
Notice \`int n = original\`. The loop destroys whatever it is given — by the end\r
\`n\` is zero — so if you want the number afterwards you need a second copy. That\r
is not a style preference. Forgetting it is the reason a printed answer says\r
\`0\` when you were sure the arithmetic was right.\r
\r
## Zero, and the other end of the loop\r
\r
\`while (n > 0)\` never runs when \`n\` is already 0. So a digit count of 0 comes\r
back as **0 digits**, and zero plainly has one digit.\r
\r
There are two honest fixes and one dishonest one.\r
\r
\`\`\`java\r
// 1. do-while: run the body once, then test\r
int count = 0;\r
do {\r
    count++;\r
    n /= 10;\r
} while (n > 0);\r
\r
// 2. handle it before the loop\r
if (n == 0) return 1;\r
\`\`\`\r
\r
The dishonest fix is to write \`while (n >= 0)\`, which never ends: \`0 / 10\` is\r
\`0\`, so \`n\` stops shrinking and the loop spins forever. If a submission of yours\r
ever "hangs", this is the first thing to look for.\r
\r
Negatives need a decision rather than a fix, because the right answer depends on\r
the question. \`-4092 % 10\` in Java is \`-2\`, not \`8\` — Java's remainder takes the\r
sign of the left operand. Usually you want \`n = Math.abs(n)\` first and to\r
remember the sign separately. Be careful of one value: \`Math.abs(Integer.MIN_VALUE)\`\r
is still negative, because there is no positive 2147483648 in an \`int\`. Problems\r
that involve reversing an integer are usually testing exactly that.\r
\r
## Divisors, and why the loop stops at the square root\r
\r
The second half of this topic is about factors: is this number prime, is it a\r
perfect number, how many divisors does it have.\r
\r
The naive answer tries every number from 2 up to \`n - 1\`. That is O(n) and it is\r
far more work than necessary, because **divisors come in pairs**. If \`d\` divides\r
36, so does \`36 / d\`:\r
\r
\`\`\`text\r
36 = 1 × 36\r
   = 2 × 18\r
   = 3 × 12\r
   = 4 × 9\r
   = 6 × 6      <- the turning point, and it is exactly sqrt(36)\r
\`\`\`\r
\r
After 6 the pairs repeat backwards — 9 × 4 is the same fact as 4 × 9. So if a\r
number has any divisor at all, it has one **at or below its square root**. Check\r
up to there and you have checked everything.\r
\r
![Divisors of 36 pairing up around its square root](diagrams/coding-foundations-notes-divisor-pairs.jpg)\r
\r
\`\`\`java\r
static boolean isPrime(int n) {\r
    if (n < 2) return false;\r
    for (int d = 2; (long) d * d <= n; d++)\r
        if (n % d == 0) return false;\r
    return true;\r
}\r
\`\`\`\r
\r
Two details in that loop are worth more than they look.\r
\r
**\`d * d <= n\` rather than \`d <= Math.sqrt(n)\`.** Multiplication on integers is\r
exact; \`Math.sqrt\` returns a \`double\` and can land a hair under the true value,\r
which for a perfect square is the difference between a right and a wrong answer.\r
Avoiding floating point when the question is about whole numbers is a habit\r
worth forming here, where it costs nothing.\r
\r
**The cast to \`long\`.** \`d * d\` is an \`int\` multiplication, and for \`n\` near\r
\`Integer.MAX_VALUE\` it overflows to a negative number before it is ever compared.\r
The loop then never ends. Casting one side makes the arithmetic 64-bit.\r
\r
That is O(√n) — for a number near two billion, about 46,000 steps instead of two\r
billion.\r
\r
## When you want every prime up to n\r
\r
Testing each number separately is O(n√n), and when a problem asks for *all* the\r
primes below a limit there is something much better: cross out the multiples\r
instead of testing the numbers. This is the **sieve of Eratosthenes**.\r
\r
\`\`\`java Sieve.java @run-coding-foundations-sieve\r
import java.util.Arrays;\r
\r
public class Sieve {\r
\r
    static int countPrimes(int limit) {\r
        if (limit < 3) return 0;\r
\r
        // composite[i] means "i has a factor other than 1 and itself"\r
        boolean[] composite = new boolean[limit];\r
        int count = 0;\r
\r
        for (int p = 2; p < limit; p++) {\r
            if (composite[p]) continue;\r
            count++;\r
            // Start at p*p: every smaller multiple of p was already crossed\r
            // out by a smaller prime.\r
            for (long m = (long) p * p; m < limit; m += p)\r
                composite[(int) m] = true;\r
        }\r
        return count;\r
    }\r
\r
    public static void main(String[] args) {\r
        System.out.println("primes below 30  " + countPrimes(30));\r
        System.out.println("primes below 100 " + countPrimes(100));\r
\r
        boolean[] composite = new boolean[20];\r
        for (int p = 2; p * p < 20; p++)\r
            if (!composite[p])\r
                for (int m = p * p; m < 20; m += p) composite[m] = true;\r
\r
        System.out.println("primes below 20  " + Arrays.toString(\r
                java.util.stream.IntStream.range(2, 20)\r
                        .filter(i -> !composite[i])\r
                        .toArray()));\r
    }\r
}\r
\`\`\`\r
\r
\`\`\`output @run-coding-foundations-sieve\r
primes below 30  10\r
primes below 100 25\r
primes below 20  [2, 3, 5, 7, 11, 13, 17, 19]\r
\`\`\`\r
\r
The inner loop starting at \`p * p\` is the part people get wrong. When \`p\` is 5,\r
the multiples 10, 15 and 20 were already struck out by 2 and 3 — the first\r
multiple of 5 that nothing smaller has reached is 25.\r
\r
![Why the sieve starts crossing out at p times p](diagrams/coding-foundations-notes-sieve-start.jpg)\r
\r
The whole thing runs in about O(n log log n), which is near enough to linear\r
that you should treat it as free. Reach for it the moment a problem says "up\r
to n" rather than "is this one prime".\r
\r
## Powers, and doing them in log n\r
\r
\`Math.pow\` returns a \`double\`, and a \`double\` cannot hold every large integer\r
exactly, so an interview answer to \`Pow(x, n)\` is expected to be written out.\r
The naive loop multiplies \`n\` times. **Fast exponentiation** halves the exponent\r
instead, using one fact:\r
\r
> x^n is (x^(n/2))², and if n is odd there is one spare x left over.\r
\r
\`\`\`java Power.java @run-coding-foundations-power\r
public class Power {\r
\r
    static long power(long base, int exponent) {\r
        long result = 1;\r
        while (exponent > 0) {\r
            if ((exponent & 1) == 1) result *= base;   // odd: take one out\r
            base *= base;                              // square the base\r
            exponent >>= 1;                            // halve the exponent\r
        }\r
        return result;\r
    }\r
\r
    public static void main(String[] args) {\r
        System.out.println("2^10  = " + power(2, 10));\r
        System.out.println("3^13  = " + power(3, 13));\r
        System.out.println("7^0   = " + power(7, 0));\r
        System.out.println("2^62  = " + power(2, 62));\r
    }\r
}\r
\`\`\`\r
\r
\`\`\`output @run-coding-foundations-power\r
2^10  = 1024\r
3^13  = 1594323\r
7^0   = 1\r
2^62  = 4611686018427387904\r
\`\`\`\r
\r
\`exponent & 1\` is "is the last bit set", which is a faster spelling of\r
\`exponent % 2 == 1\`. \`exponent >>= 1\` is "shift the bits right one place", which\r
is \`exponent /= 2\`. Both are the ordinary way this is written and you will meet\r
them again in [bit manipulation](#/dsa/bit-manipulation/notes).\r
\r
Thirteen becomes six becomes three becomes one becomes zero — four passes rather\r
than thirteen. For an exponent of a billion it is thirty passes rather than a\r
billion.\r
\r
The same halving is why *Power of Two* and *Power of Three* have neat answers:\r
keep dividing by the base while it divides evenly, and see whether you land on\r
exactly 1.\r
\r
## The mistakes, in the order people make them\r
\r
1. **Losing the original number.** The digit loop consumes \`n\`. Copy it first.\r
2. **Forgetting zero.** \`while (n > 0)\` produces nothing at all for \`n = 0\`.\r
   Decide what that should mean before you write the loop, not after a test\r
   fails.\r
3. **\`while (n >= 0)\`.** An infinite loop, because zero divided by ten is zero.\r
4. **Overflow when reversing.** Reversing 1534236469 does not fit in an \`int\`.\r
   Accumulate into a \`long\` and compare against \`Integer.MAX_VALUE\`, or check\r
   before each multiplication.\r
5. **\`Math.sqrt\` in a divisor loop.** Use \`d * d <= n\`, and cast to \`long\` so\r
   the square itself cannot overflow.\r
6. **\`int\` overflow in the loop condition.** \`d * d\` for large \`n\` goes negative\r
   and the loop runs forever, which reads as a timeout rather than a wrong\r
   answer, which sends you looking in the wrong place.\r
7. **Floating point for exact arithmetic.** \`0.1 + 0.2\` is not \`0.3\`, and\r
   \`Math.pow(3, 5)\` is a \`double\` that happens to print nicely. If the answer is\r
   a whole number, keep the whole calculation in whole numbers.\r
\r
## The Java you will reach for\r
\r
| You want | Write |\r
|---|---|\r
| Last digit | \`n % 10\` |\r
| Drop the last digit | \`n / 10\` |\r
| Is it even | \`(n & 1) == 0\` or \`n % 2 == 0\` |\r
| Digits of a number, as text | \`String.valueOf(n)\` then \`charAt(i) - '0'\` |\r
| Bigger, smaller | \`Math.max(a, b)\`, \`Math.min(a, b)\` |\r
| Absolute value | \`Math.abs(n)\` — mind \`Integer.MIN_VALUE\` |\r
| Largest and smallest \`int\` | \`Integer.MAX_VALUE\`, \`Integer.MIN_VALUE\` |\r
| Avoid overflow | do the arithmetic in \`long\`, then check the range |\r
| Fill an array | \`Arrays.fill(a, value)\` |\r
| Print an array | \`Arrays.toString(a)\` |\r
\r
Converting a digit character to its value is \`c - '0'\`, because the digits sit\r
next to each other in the character set: \`'7' - '0'\` is 7. It is the single most\r
useful trick in the topic and it comes up again in every string problem.\r
\r
## Working one from the sheet\r
\r
**[Happy Number](problem:happy-number).** Replace the number by the sum of the squares of its digits,\r
repeat, and see whether you reach 1. If you do not, you loop forever.\r
\r
The digit part is the loop you already have:\r
\r
\`\`\`java\r
static int squareSum(int n) {\r
    int sum = 0;\r
    while (n > 0) {\r
        int d = n % 10;\r
        sum += d * d;\r
        n /= 10;\r
    }\r
    return sum;\r
}\r
\`\`\`\r
\r
The only new question is how to notice a cycle without storing every number you\r
have seen. The trick is the same one used on linked lists: run two copies at\r
different speeds, one taking one step per round and one taking two. If there is\r
a cycle they eventually stand on the same value; if there is not, the fast one\r
reaches 1 first.\r
\r
\`\`\`java Happy.java @run-coding-foundations-happy\r
public class Happy {\r
\r
    static int squareSum(int n) {\r
        int sum = 0;\r
        while (n > 0) {\r
            int d = n % 10;\r
            sum += d * d;\r
            n /= 10;\r
        }\r
        return sum;\r
    }\r
\r
    static boolean isHappy(int n) {\r
        int slow = n;\r
        int fast = squareSum(n);\r
        while (fast != 1 && slow != fast) {\r
            slow = squareSum(slow);\r
            fast = squareSum(squareSum(fast));\r
        }\r
        return fast == 1;\r
    }\r
\r
    public static void main(String[] args) {\r
        for (int n : new int[] { 1, 7, 19, 2, 4, 116 })\r
            System.out.println(n + " -> " + isHappy(n));\r
    }\r
}\r
\`\`\`\r
\r
\`\`\`output @run-coding-foundations-happy\r
1 -> true\r
7 -> true\r
19 -> true\r
2 -> false\r
4 -> false\r
116 -> false\r
\`\`\`\r
\r
You have now used a digit loop, a termination argument and cycle detection in\r
about twenty lines, which is a fair description of what this whole topic is\r
for.\r
\r
## How to work through the topic\r
\r
Do them in this order rather than top to bottom:\r
\r
1. [Fizz Buzz](problem:fizz-buzz), [Add Digits](problem:add-digits),\r
   [Palindrome Number](problem:palindrome-number). The digit loop, three ways.\r
   If any of these takes more than five minutes, stay here.\r
2. [Power of Two](problem:power-of-two), [Power of Three](problem:power-of-three),\r
   [Ugly Number](problem:ugly-number). Repeated division, and the habit of\r
   asking whether you land exactly on 1.\r
3. [Sqrt(x)](problem:sqrtx), [Pow(x, n)](problem:powx-n),\r
   [Divide Two Integers](problem:divide-two-integers). No floating point\r
   allowed. This is where you learn to think in bounds and overflow.\r
4. [Count Primes](problem:count-the-number-of-prime-numbers-less-than-n),\r
   [Factorial Trailing Zeroes](problem:factorial-trailing-zeroes). The moment\r
   counting beats testing. Trailing zeroes is the nicest problem here: the\r
   answer is how many fives are in the factorisation, and you never build the\r
   factorial at all.\r
5. [Number of Digit One](problem:number-of-digit-one),\r
   [Super Pow](problem:super-pow). Both are digit loops with the arithmetic\r
   pushed one level further. Leave them until the first four are automatic.\r
\r
The measure of being done with this topic is not how many are ticked. It is\r
whether you can write the digit loop, the divisor loop and fast exponentiation\r
from memory, with the zero case and the overflow case already handled — because\r
every one of them turns up inside a harder problem later, where it will not be\r
the part you are supposed to be thinking about.\r
`;export{e as default};