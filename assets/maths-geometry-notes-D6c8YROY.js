var e=`This is the topic where the answer is usually one identity you either remember or
derive on the spot. There is no data structure to choose and no traversal to
write. There is a fact about numbers — that the greatest common divisor of \`a\`
and \`b\` is the greatest common divisor of \`b\` and \`a % b\`, that the sign of a
cross product tells you which side of a line a point is on — and once you have
the fact, the code is four lines.

That makes the category feel unfair when you have not met the identity, and
trivial once you have. The set worth carrying is small: the Euclidean algorithm,
arithmetic modulo a large prime, fast exponentiation, a sieve, \`nCr\`, the cross
product, and the shoelace formula. Seven things. Everything on this list is built
out of them.

The second half of the topic is the one that actually loses marks: **overflow and
floating point**. These problems deal in large numbers by design, an \`int\`
overflows silently at a little over two billion, and \`double\` cannot represent a
third. The habit to build is to reach for \`long\` before you need it, and to
express geometry with integer arithmetic wherever the input is integral — which,
in interview problems, it nearly always is.

## The integer toolkit: gcd and lcm

The greatest common divisor of two numbers is the largest number dividing both.
Euclid's observation is that anything dividing \`a\` and \`b\` also divides
\`a % b\`, so the pair \`(a, b)\` can be replaced by \`(b, a % b)\` without changing the
answer, and the numbers shrink fast.

\`\`\`java
long gcd(long a, long b) { return b == 0 ? a : gcd(b, a % b); }
// lcm(a, b) == a / gcd(a, b) * b   — divide first, or it overflows
\`\`\`

That is the pattern card's shape, and the comment on the second line is the part
that gets people. \`a * b / gcd(a, b)\` is the same value mathematically and
overflows for inputs where \`a / gcd(a, b) * b\` does not, because the product
\`a * b\` is computed first. Divide first. The division is exact, since the gcd
divides \`a\` by definition.

Two facts that fall straight out and turn up repeatedly:

- **Reducing a fraction.** \`dy/dx\` divided by \`gcd(|dy|, |dx|)\` is the fraction in
  lowest terms — the key you need for [Max Points on a Line](problem:max-points-on-a-line).
- **\`gcd(a, 0) == a\`.** The recursion stops there, which is also why a gcd with
  zero is safe rather than a special case.

The loop runs in O(log min(a, b)) steps, which is fast enough that gcd inside
another loop is rarely the bottleneck.

## Modular arithmetic, and why 1000000007

A question that says "return the answer modulo 10⁹ + 7" is telling you the answer
is astronomically large — the number of ways to do something, a product of many
terms — and that it wants the remainder rather than the number. You are not
expected to compute the number and then reduce it. You are expected to reduce as
you go.

That works because the remainder operation passes through addition,
multiplication and subtraction:

\`\`\`text
(a + b) % m == ((a % m) + (b % m)) % m
(a × b) % m == ((a % m) × (b % m)) % m
(a - b) % m == ((a % m) - (b % m) + m) % m      <- the + m matters
\`\`\`

Division does not pass through, which is the one exception and the reason modular
inverses exist (below).

Why that particular modulus? Three reasons, and they are worth being able to say.
It is prime, which makes every non-zero value invertible and makes Fermat's little
theorem available. It fits in an \`int\`. And its square, about 10¹⁸, still fits in
a \`long\`, whose limit is roughly 9.2 × 10¹⁸ — so the product of any two reduced
values can be formed in a \`long\` without overflowing before you reduce it again.

\`\`\`java
long mod = 1_000_000_007L;
long product = (a % mod) * (b % mod) % mod;   // a and b as long, not int
\`\`\`

The \`L\` on the literal and the \`long\` type on both operands are not decoration. If
\`a\` and \`b\` are \`int\`, \`a * b\` is computed as \`int\` and overflows *before* the
widening to \`long\` happens. Java multiplies at the wider of the two operand types
and no wider, so at least one side has to be \`long\` already.

![An int product overflowing before it is widened to long](diagrams/maths-geometry-notes-widening.jpg)

The \`+ m\` on subtraction is for the same class of reason: Java's \`%\` takes the
sign of the left operand, so \`(3 - 5) % 7\` is \`-2\`, not \`5\`. Either add the
modulus back, or use \`Math.floorMod\`, which does the right thing for negatives.
The same trap appears whenever you index an array by a hash — see
[coding foundations](#/dsa/coding-foundations/notes) for the digit-by-digit
version of these habits.

## Fast exponentiation

![Reading the exponent one bit at a time, squaring the base each step](diagrams/maths-geometry-notes-square-and-multiply.jpg)

Computing \`bᵉ\` by multiplying \`e\` times is O(e), which is hopeless when \`e\` is a
billion. Square-and-multiply makes it O(log e) by using the binary expansion of
the exponent: square the base at every step, and multiply the answer in only when
the current bit of the exponent is set.

\`\`\`text
3^13,  13 = 1101 in binary

bit 1 (1)   answer = 3            base -> 9
bit 0 (0)   answer = 3            base -> 81
bit 1 (1)   answer = 3 × 81       base -> 6561
bit 1 (1)   answer = 243 × 6561 = 1594323
\`\`\`

Reading the exponent bit by bit with \`e & 1\` and \`e >>= 1\` is the same
manipulation as in [bit manipulation](#/dsa/bit-manipulation/notes), used here for
arithmetic rather than for flags. It is the answer to [Pow(x, n)](problem:powx-n)
and, with a modulus threaded through, to [Super Pow](problem:super-pow).

The modular version has one more use. In a prime modulus \`p\`, Fermat's little
theorem says \`a^(p-1) ≡ 1\`, so \`a^(p-2)\` is the multiplicative inverse of \`a\` —
the thing you multiply by instead of dividing. That is how a binomial coefficient
gets computed modulo a prime.

## Primes: trial division and the sieve

Two questions, two different answers.

**Is this one number prime, or what are its factors?** Trial division up to the
square root. If \`n = a × b\` then one of \`a\` and \`b\` is at most \`√n\`, so no factor
above the square root can be the smallest one. Test 2, then odd numbers up to
\`√n\`, dividing out each factor as you find it. O(√n).

Write the loop as \`for (long f = 2; f * f <= n; f++)\`, not \`f <= Math.sqrt(n)\`.
The first is integer arithmetic and exact; the second converts to \`double\` every
iteration and can be wrong by one at large values.

**How many primes are below n?** The sieve of Eratosthenes. Start with every
number marked prime, walk upwards, and for each prime cross off its multiples.
Two refinements make it fast: start crossing off at \`p × p\`, because every smaller
multiple of \`p\` was already crossed off by a smaller prime; and stop the outer
loop at \`√n\` for the same reason. O(n log log n), which for these purposes is
close enough to linear.

![The sieve crossing off multiples, starting each prime at p squared](diagrams/maths-geometry-notes-sieve.jpg)

[Count Primes](problem:count-the-number-of-prime-numbers-less-than-n) is the sieve
verbatim. [Ugly Number](problem:ugly-number) is repeated division by a fixed set
of factors. [Factorial Trailing Zeroes](problem:factorial-trailing-zeroes) is
prime factorisation reasoning without any factorising: a trailing zero is a factor
of 10, which is 2 × 5, and there are always more 2s than 5s in \`n!\`, so the answer
is simply how many 5s divide into it — \`n/5 + n/25 + n/125 + …\`.

\`\`\`java Numbers.java @run-maths-geometry-numbers
public class Numbers {

    private static final long MOD = 1_000_000_007L;

    /** Euclid: anything dividing a and b also divides a % b. */
    static long gcd(long a, long b) {
        while (b != 0) { long t = a % b; a = b; b = t; }
        return a;
    }

    /** Divide before multiplying, or the product overflows first. */
    static long lcm(long a, long b) { return a / gcd(a, b) * b; }

    /** base^exp mod m, by squaring. O(log exp). */
    static long modPow(long base, long exp, long m) {
        long result = 1;
        base %= m;
        while (exp > 0) {
            if ((exp & 1) == 1) result = result * base % m;   // this bit is set
            base = base * base % m;
            exp >>= 1;
        }
        return result;
    }

    /** How many primes are strictly below n. */
    static int countPrimes(int n) {
        if (n < 3) return 0;
        boolean[] composite = new boolean[n];
        int found = 0;
        for (int p = 2; p < n; p++) {
            if (composite[p]) continue;
            found++;
            if ((long) p * p >= n) continue;
            for (int m = p * p; m < n; m += p) composite[m] = true;
        }
        return found;
    }

    /** Prime factors, smallest first, with repeats. */
    static String factorise(long n) {
        StringBuilder sb = new StringBuilder();
        for (long f = 2; f * f <= n; f++)
            while (n % f == 0) { sb.append(f).append(' '); n /= f; }
        if (n > 1) sb.append(n);           // whatever is left is prime
        return sb.toString().trim();
    }

    /** n choose r, exactly. Each division is exact, so nothing is lost. */
    static long choose(int n, int r) {
        r = Math.min(r, n - r);
        long result = 1;
        for (int i = 1; i <= r; i++) result = result * (n - r + i) / i;
        return result;
    }

    /** n choose r modulo a prime, using a^(p-2) as the inverse of a. */
    static long chooseMod(int n, int r) {
        long numerator = 1, denominator = 1;
        for (int i = 0; i < r; i++) {
            numerator = numerator * (n - i) % MOD;
            denominator = denominator * (i + 1) % MOD;
        }
        return numerator * modPow(denominator, MOD - 2, MOD) % MOD;
    }

    public static void main(String[] args) {
        System.out.println("gcd(48, 18)      " + gcd(48, 18));
        System.out.println("gcd(17, 0)       " + gcd(17, 0));
        System.out.println("lcm(4, 6)        " + lcm(4, 6));
        System.out.println("2^100 mod 1e9+7  " + modPow(2, 100, MOD));
        System.out.println("primes below 30  " + countPrimes(30));
        System.out.println("360 =            " + factorise(360));
        System.out.println("97 =             " + factorise(97) + "   (prime)");
        System.out.println("C(50, 25)        " + choose(50, 25));
        System.out.println("C(50, 25) mod p  " + chooseMod(50, 25));
    }
}
\`\`\`

\`\`\`output @run-maths-geometry-numbers
gcd(48, 18)      6
gcd(17, 0)       17
lcm(4, 6)        12
2^100 mod 1e9+7  976371285
primes below 30  10
360 =            2 2 2 3 3 5
97 =             97   (prime)
C(50, 25)        126410606437752
C(50, 25) mod p  605552882
\`\`\`

## Combinatorics you actually need

Two shapes cover nearly everything at this level.

**Pascal's triangle** — each entry is the sum of the two above it, which is
\`C(n, r) = C(n-1, r-1) + C(n-1, r)\`. It needs only addition, so it never
overflows before the values themselves do, and it is the answer to
[Pascal's Triangle](problem:pascals-triangle) and
[Pascal's Triangle II](problem:pascals-triangle-ii). Building row \`n\` in place,
from the right, is how the second one is done in O(n) space.

**The multiplicative form** — \`C(n, r) = Π (n - r + i) / i\` for \`i\` from 1 to \`r\`.
Every partial product is divisible by the \`i\` you are about to divide by, because
a product of \`i\` consecutive integers is always divisible by \`i!\`. So the running
value stays an exact integer and never needs a factorial computed on its own,
which is what would overflow. Halving the work with \`r = min(r, n - r)\` is free
and worth doing.

When the answer is wanted modulo a prime, division is not available, so you
multiply by the modular inverse instead — \`modPow(denominator, MOD - 2, MOD)\` in
the program above.

## Points, and the cross product

The geometry half rests on one number. For points \`a\`, \`b\`, \`c\`:

\`\`\`java
long cross = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
\`\`\`

This is the z-component of the cross product of the vectors \`a→b\` and \`a→c\`, and
its **sign** answers the question you actually have:

| Sign | Meaning |
|---|---|
| positive | \`c\` is to the left of the directed line \`a→b\` — an anticlockwise turn |
| negative | \`c\` is to the right — a clockwise turn |
| zero | the three points are collinear |

Everything else in plane geometry at this level is a use of that sign. Collinear
means the cross product is zero. Convex hull is a sequence of turns in one
direction. Two segments cross when each one's endpoints fall on opposite sides of
the other.

The absolute value has a meaning too: it is twice the area of the triangle
\`a, b, c\`. Twice, so that integer coordinates give an integer, which is precisely
why you should keep it doubled and never divide until the last moment.

## Collinearity, area, and the shoelace formula

For a polygon given as vertices in order, the signed area is

\`\`\`text
2 × area = Σ (xᵢ × yᵢ₊₁ − xᵢ₊₁ × yᵢ)     with the last vertex wrapping to the first
\`\`\`

which is the same cross product summed around the boundary. Take the absolute
value at the end and halve it. The sign before you do tells you whether the
vertices were listed anticlockwise (positive) or clockwise (negative), which is
occasionally the question.

The reason it is called the shoelace formula is the way the terms cross over when
you write the coordinates in two columns and draw the multiplications. The reason
to care is that it computes an area with no trigonometry, no square roots, and —
if the coordinates are integers — no floating point at all.

\`\`\`java Points.java @run-maths-geometry-points
import java.util.Arrays;

public class Points {

    /**
     * Twice the signed area of the triangle a, b, c. Positive means c is to the
     * left of a -> b, negative means to the right, zero means collinear.
     */
    static long cross(long[] a, long[] b, long[] c) {
        return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    }

    static int turn(long[] a, long[] b, long[] c) { return Long.signum(cross(a, b, c)); }

    static boolean collinear(long[] a, long[] b, long[] c) { return cross(a, b, c) == 0; }

    /** Assumes p is collinear with a-b: is it inside the bounding box? */
    static boolean onSegment(long[] a, long[] b, long[] p) {
        return Math.min(a[0], b[0]) <= p[0] && p[0] <= Math.max(a[0], b[0])
            && Math.min(a[1], b[1]) <= p[1] && p[1] <= Math.max(a[1], b[1]);
    }

    /** Do segments p1-p2 and q1-q2 share at least one point? */
    static boolean segmentsCross(long[] p1, long[] p2, long[] q1, long[] q2) {
        int a = turn(p1, p2, q1), b = turn(p1, p2, q2);
        int c = turn(q1, q2, p1), d = turn(q1, q2, p2);
        if (a != b && c != d) return true;             // each straddles the other
        if (a == 0 && onSegment(p1, p2, q1)) return true;   // the collinear cases
        if (b == 0 && onSegment(p1, p2, q2)) return true;
        if (c == 0 && onSegment(q1, q2, p1)) return true;
        return d == 0 && onSegment(q1, q2, p2);
    }

    /** Twice the polygon's area, by the shoelace sum. Integer throughout. */
    static long twiceArea(long[][] polygon) {
        long total = 0;
        for (int i = 0; i < polygon.length; i++) {
            long[] p = polygon[i];
            long[] q = polygon[(i + 1) % polygon.length];
            total += p[0] * q[1] - q[0] * p[1];
        }
        return total;
    }

    public static void main(String[] args) {
        long[] a = { 0, 0 }, b = { 4, 0 }, left = { 2, 3 }, right = { 2, -3 }, on = { 2, 0 };
        System.out.println("turn to " + Arrays.toString(left) + "  " + turn(a, b, left) + "   anticlockwise");
        System.out.println("turn to " + Arrays.toString(right) + " " + turn(a, b, right) + "  clockwise");
        System.out.println("collinear " + collinear(a, b, on));

        long[][] square = { { 0, 0 }, { 4, 0 }, { 4, 3 }, { 0, 3 } };
        long twice = twiceArea(square);
        System.out.println("square: twice area " + twice + ", area " + twice / 2.0);

        long[][] clockwise = { { 0, 0 }, { 0, 3 }, { 4, 3 }, { 4, 0 } };
        System.out.println("same square listed clockwise: " + twiceArea(clockwise));

        System.out.println("cross    " + segmentsCross(a, new long[] { 4, 4 },
                                                       new long[] { 0, 4 }, b));
        System.out.println("apart    " + segmentsCross(new long[] { 0, 0 }, new long[] { 1, 1 },
                                                       new long[] { 2, 2 }, new long[] { 3, 3 }));
        System.out.println("touching " + segmentsCross(new long[] { 0, 0 }, new long[] { 4, 4 },
                                                       new long[] { 2, 2 }, new long[] { 5, 5 }));
    }
}
\`\`\`

\`\`\`output @run-maths-geometry-points
turn to [2, 3]  1   anticlockwise
turn to [2, -3] -1  clockwise
collinear true
square: twice area 24, area 12.0
same square listed clockwise: -24
cross    true
apart    false
touching true
\`\`\`

Note what is missing from that file: any \`double\` except the final division by
two, and any call into \`Math\` beyond \`min\`, \`max\` and \`signum\`. That is the target
for every integer-coordinate geometry problem.

## Rectangles, and when the geometry is just arithmetic

Not every geometry question needs vectors. [Rectangle Area](problem:rectangle-area)
asks for the total area covered by two axis-aligned rectangles, which is the sum
of the two areas minus their overlap, and the overlap is one line:

\`\`\`java
long wide = Math.max(0, Math.min(ax2, bx2) - Math.max(ax1, bx1));
long tall = Math.max(0, Math.min(ay2, by2) - Math.max(ay1, by1));
long overlap = wide * tall;      // max(0, ...) makes "no overlap" fall out
\`\`\`

The \`Math.max(0, …)\` is doing the case analysis for you. Without it, two
rectangles that miss each other produce a negative width and a positive
"overlap", and the answer comes out too small. Sum the areas in \`long\`; the
coordinate limits in these questions are chosen so that an \`int\` sum overflows.

[Minimum Area Rectangle](problem:minimum-area-rectangle) is a different kind of
problem wearing geometry's clothes: put every point in a hash set, then for each
pair of points treat them as a diagonal and ask whether the other two corners
exist. The geometry is one line; the work is the set lookup.

## Floating point, and how to avoid it

A \`double\` stores about fifteen significant decimal digits and cannot represent
0.1, 0.2 or a third exactly. Two consequences, both of which cost marks.

**Never compare with \`==\`.** \`0.1 + 0.2 == 0.3\` is false. When floating point is
unavoidable, compare against a tolerance:

\`\`\`java
static final double EPS = 1e-9;
if (Math.abs(x - y) < EPS) { /* equal enough */ }
\`\`\`

Choosing the epsilon is a judgement — too small and equal values look different,
too large and different values look equal. For coordinates up to 10⁴, \`1e-9\` is
the usual choice.

**Prefer integers wherever the problem allows it.** This is the more important
half. Almost every geometry problem you will be set has integer coordinates, and
almost every question about them can be phrased without division:

| Instead of | Write |
|---|---|
| slope \`dy / dx\` | the reduced pair \`(dy/g, dx/g)\` with \`g = gcd\` |
| \`area = base × height / 2\` | twice the area, as an integer |
| \`dist = Math.sqrt(dx*dx + dy*dy)\` | \`dx*dx + dy*dy\` — squared distance compares the same |
| \`a / b == c / d\` | \`a * d == c * b\`, in \`long\` |

Squared distance is the one to remember. Square root is monotonic, so anything
that only ranks distances — nearest point, closest pair,
[K Closest Points to Origin](problem:k-closest-points-to-origin) — can compare the
squares and never call \`Math.sqrt\` at all. That is faster and, more to the point,
exact.

## What it costs

| Operation | Cost | Why |
|---|---|---|
| gcd | O(log min(a, b)) | the pair shrinks geometrically |
| Fast exponentiation | O(log e) | one squaring per bit of the exponent |
| Primality of one number | O(√n) | no factor above the square root can be the smallest |
| Sieve up to n | O(n log log n) | each prime crosses off n/p multiples |
| Factorise one number | O(√n) | trial division, dividing factors out as found |
| \`nCr\` multiplicatively | O(min(r, n − r)) | one multiply and one divide per term |
| Shoelace area | O(vertices) | one cross product per edge |
| Max points on a line | O(n²) | slopes from every point to every other |

## The mistakes, in the order people make them

1. **Overflow in an \`int\`.** \`int\` runs out just past 2.1 billion. Any product of
   two things that could each be 10⁵ needs \`long\`, and the widening has to happen
   before the multiply: \`(long) a * b\`, not \`(long) (a * b)\`.
2. **Multiplying before dividing.** \`a * b / gcd\` overflows where
   \`a / gcd * b\` does not.
3. **Reducing only at the end.** In a modular product, reduce after every step,
   not once at the end — by the end the number no longer exists.
4. **Negative remainders.** Java's \`%\` follows the sign of the left operand.
   \`Math.floorMod\` when the result is used as an index or a canonical residue.
5. **\`f <= Math.sqrt(n)\` as a loop bound.** Use \`f * f <= n\`; it is exact and it
   avoids a \`double\` conversion every iteration.
6. **Comparing doubles with \`==\`.** Use an epsilon, or restructure so there are
   no doubles.
7. **Dividing to get a slope.** Vertical lines divide by zero and near-equal
   slopes compare equal. Store the reduced \`(dy, dx)\` pair, sign-normalised so
   that \`(1, 2)\` and \`(-1, -2)\` are the same key.
8. **Forgetting \`n = 0\` and negatives.** \`Reverse Integer\` overflows on the
   reversal itself, \`Power of Two\` has to reject zero and negatives, and a digit
   loop over 0 produces no digits at all unless you check.
9. **Halving an area too early.** Keep twice the area as an integer for as long
   as you can.

## The Java you will reach for

| You want | Write |
|---|---|
| Widen before multiplying | \`(long) a * b\` |
| Remainder that is never negative | \`Math.floorMod(a, m)\` |
| Integer square root, checked | \`long r = (long) Math.sqrt(n); while (r*r > n) r--;\` |
| Limits | \`Integer.MAX_VALUE\`, \`Long.MAX_VALUE\` |
| Sign of a number | \`Long.signum(x)\`, \`Integer.signum(x)\` |
| Absolute value | \`Math.abs\` — but \`Math.abs(Integer.MIN_VALUE)\` is still negative |
| Big values beyond \`long\` | \`BigInteger\` — \`add\`, \`multiply\`, \`mod\`, \`modPow\` |
| Exact division check | \`a % b == 0\` |
| Powers of ten | build them in a \`long\` loop, not with \`Math.pow\` |
| Boolean array for a sieve | \`new boolean[n]\` — one byte each, not one bit |

\`Math.pow\` returns a \`double\` and is wrong for large integer powers —
\`(long) Math.pow(10, 18)\` is not 10¹⁸. Write the loop.

## Working one from the sheet

[Max Points on a Line](problem:max-points-on-a-line): given distinct points, find
the most that lie on one straight line.

The observation that makes it tractable: any line with at least two points on it
passes through some point in the input. So fix a point \`i\`, compute the direction
from \`i\` to every other point, and count how many share a direction. The largest
count plus one — for \`i\` itself — is the best line through \`i\`. Do that for each
\`i\` and take the maximum. O(n²), which is the intended cost.

The whole difficulty is the key. A slope as a \`double\` fails twice: vertical lines
divide by zero, and two genuinely different slopes can round to the same value. So
the key is the direction *vector* \`(dy, dx)\`, reduced by its gcd so \`(2, 4)\` and
\`(1, 2)\` agree, and sign-normalised so \`(1, 2)\` and \`(-1, -2)\` — the same line,
opposite directions — also agree. Integers throughout, and no division.

\`\`\`java MaxPoints.java @run-maths-geometry-max-points
import java.util.HashMap;
import java.util.Map;

public class MaxPoints {

    static int gcd(int a, int b) {
        while (b != 0) { int t = a % b; a = b; b = t; }
        return a;
    }

    static int maxPoints(int[][] pts) {
        if (pts.length <= 2) return pts.length;

        int best = 2;
        for (int i = 0; i < pts.length; i++) {
            Map<String, Integer> directions = new HashMap<>();
            for (int j = i + 1; j < pts.length; j++) {
                int dx = pts[j][0] - pts[i][0];
                int dy = pts[j][1] - pts[i][1];

                int g = gcd(Math.abs(dx), Math.abs(dy));   // gcd(x, 0) == x, so this is safe
                dx /= g;
                dy /= g;
                if (dx < 0 || (dx == 0 && dy < 0)) { dx = -dx; dy = -dy; }   // one direction per line

                int sharing = directions.merge(dx + "," + dy, 1, Integer::sum);
                best = Math.max(best, sharing + 1);        // + 1 for point i itself
            }
        }
        return best;
    }

    public static void main(String[] args) {
        System.out.println(maxPoints(new int[][] { { 1, 1 }, { 2, 2 }, { 3, 3 } }));
        System.out.println(maxPoints(new int[][] {
                { 1, 1 }, { 3, 2 }, { 5, 3 }, { 4, 1 }, { 2, 3 }, { 1, 4 } }));
        System.out.println(maxPoints(new int[][] { { 0, 0 }, { 0, 5 }, { 0, 9 }, { 7, 2 } }));
        System.out.println(maxPoints(new int[][] { { 1, 1 } }));
    }
}
\`\`\`

\`\`\`output @run-maths-geometry-max-points
3
4
3
1
\`\`\`

\`directions.merge(key, 1, Integer::sum)\` inserts 1 the first time and adds 1
thereafter, returning the new count — the standard counting idiom from
[hash tables](#/dsa/hash-tables/notes). The \`+ 1\` outside it is the point \`i\`,
which is on every line through \`i\` and is never in the map.

The vertical case falls out for free. With \`dx == 0\` the gcd is \`|dy|\`, the
reduced vector is \`(0, 1)\`, and nothing has divided by zero.

## How to work through the topic

1. [Palindrome Number](problem:palindrome-number) and
   [Power of Two](problem:power-of-two). Digit loops and a single bit trick, with
   the negative and zero cases handled deliberately rather than by luck.
2. [Excel Sheet Column Number](problem:excel-sheet-column-number) and
   [Strobogrammatic Number](problem:strobogrammatic-number). Base 26 with no
   zero digit, then a two-pointer walk with a mapping table.
3. [Count Primes](problem:count-the-number-of-prime-numbers-less-than-n) and
   [Ugly Number](problem:ugly-number). The sieve, written with the \`p × p\` start,
   and repeated division by a fixed factor set.
4. [Reverse Integer](problem:reverse-integer) and
   [Factorial Trailing Zeroes](problem:factorial-trailing-zeroes). The first is
   entirely about detecting overflow before it happens; the second is a
   factorisation argument with no factorising in it.
5. [Rectangle Area](problem:rectangle-area) and
   [Nth Digit](problem:nth-digit). Overlap by \`max(0, min − max)\`, and counting
   in blocks of numbers by their digit length.
6. [Perfect Squares](problem:perfect-squares) and
   [Integer Break](problem:integer-break). Where the topic meets
   [dynamic programming](#/dsa/dynamic-programming/notes) — and where both also
   have a closed-form answer worth knowing about.
7. [Max Points on a Line](problem:max-points-on-a-line) and
   [Minimum Area Rectangle](problem:minimum-area-rectangle). Reduced direction
   vectors, then points in a hash set treated as diagonals. Leave
   [K-th Smallest in Lexicographical Order](problem:k-th-smallest-in-lexicographical-order)
   and [Numbers With Repeated Digits](problem:numbers-with-repeated-digits) until
   last; both are counting arguments rather than arithmetic ones.
`;export{e as default};