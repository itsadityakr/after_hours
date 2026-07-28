var e=`An \`int\` in Java is thirty-two switches. Usually you think of it as a number,
and occasionally the problem is easier if you stop — a set of thirty-two yes/no
answers, a bag of flags, a subset of a small collection. The moment you can see
it both ways, a class of problem stops needing extra memory at all.

This topic has a reputation for being tricky. It is not: there are six
operators, four idioms, and one Java-specific trap. What makes it feel hard is
that the tricks are unmemorable until you have drawn the bits out once, so this
page draws them out.

## Binary, in one minute

A number written in binary is the same place-value idea as decimal, with two
digits instead of ten and powers of two instead of powers of ten.

\`\`\`text
   13 in binary
   1     1     0     1
   8  +  4  +  0  +  1   = 13
   2^3   2^2   2^1   2^0
\`\`\`

The rightmost bit is bit 0 and is worth 1. Bit \`k\` is worth 2^k. Java writes
binary literals with \`0b\`, so \`0b1101\` is 13, and \`Integer.toBinaryString(13)\`
prints \`1101\`.

An \`int\` has 32 bits, and the top one is the **sign bit**: when it is set the
number is negative. That is the source of the one trap in this topic, and it
comes up in a moment.

## The six operators

| Operator | Name | On each bit |
|---|---|---|
| \`a & b\` | AND | 1 only if both are 1 |
| <code>a &#124; b</code> | OR | 1 if either is 1 |
| \`a ^ b\` | XOR | 1 if they differ |
| \`~a\` | NOT | flips every bit |
| \`a << k\` | left shift | move up \`k\` places, ×2^k |
| \`a >> k\` | arithmetic right shift | move down \`k\`, keeps the sign |
| \`a >>> k\` | logical right shift | move down \`k\`, fills with 0 |

Drawn out on a byte's worth of bits:

\`\`\`text
a = 12   0000 1100
b = 10   0000 1010

a & b    0000 1000   =  8   (both)
a | b    0000 1110   = 14   (either)
a ^ b    0000 0110   =  6   (differ)
a << 1   0001 1000   = 24   (doubled)
a >> 1   0000 0110   =  6   (halved)
\`\`\`

**The Java trap is \`>>\` versus \`>>>\`.** \`>>\` copies the sign bit as it shifts, so
\`-8 >> 1\` is \`-4\`, which is right if the value is a number. \`>>>\` shifts a zero
in, so \`-8 >>> 1\` is 2147483644, which is right if the value is a bag of bits.
Use \`>>>\` whenever you are walking bits rather than dividing. Every "count the
bits" loop that hangs forever on a negative input is this.

There is no \`<<<\`. Shifting left has no sign question to answer.

## The four idioms

These are the ones worth knowing by heart. Everything else is built from them.

\`\`\`java
x & 1        // lowest bit: 1 if odd
x >>> 1      // drop the lowest bit
a ^ a == 0   // XOR cancels a pair
x & (x - 1)  // clear the lowest set bit
\`\`\`

The last two are the interesting ones.

**XOR cancels.** \`a ^ a\` is 0 because every bit differs from itself in no place.
And XOR does not care what order it is applied in, so XOR-ing a whole array
cancels every value that appears twice and leaves whatever appears once. That is
[Single Number](problem:single-number) in one line, with no extra memory.

**\`x & (x - 1)\` clears the lowest set bit.** Subtracting one flips the lowest 1
to 0 and turns every 0 below it into 1; AND-ing with the original keeps only the
bits above:

\`\`\`text
x       = 12   0000 1100
x - 1   = 11   0000 1011
x & x-1 =  8   0000 1000   <- the lowest 1 is gone
\`\`\`

So a loop that repeats it runs once per set bit rather than thirty-two times,
which is Brian Kernighan's population count. And \`x & (x - 1) == 0\` means "at
most one bit set", which is the neat test for a power of two.

The mirror idiom, \`x & -x\`, keeps *only* the lowest set bit and throws the rest
away. That one is the heart of the [Fenwick tree](#/dsa/fenwick-tree-binary-indexed-tree/notes)
several topics later.

## Testing, setting and clearing one bit

The general form is a **mask**: a number with a single 1 in the position you care
about, made by shifting.

\`\`\`java
int mask = 1 << k;

boolean isSet = (x & mask) != 0;   // test
x |= mask;                          // set to 1
x &= ~mask;                         // clear to 0
x ^= mask;                          // flip
\`\`\`

\`~mask\` is every bit except that one, so AND-ing with it clears exactly that
position and leaves everything else alone. These four lines are all there is to
"use an integer as a set", which is how a subset of up to 32 items is represented
in bitmask dynamic programming.

\`\`\`java Bits.java @run-bit-manipulation-bits
public class Bits {

    static String show(int x) {
        return String.format("%8s", Integer.toBinaryString(x & 0xFF)).replace(' ', '0');
    }

    /** Brian Kernighan: one iteration per set bit. */
    static int countBits(int x) {
        int count = 0;
        while (x != 0) {
            x &= x - 1;
            count++;
        }
        return count;
    }

    public static void main(String[] args) {
        int x = 0b0010_1100;                 // 44
        System.out.println("x          " + show(x) + "  = " + x);
        System.out.println("x & 1      " + (x & 1) + "  (odd?)");
        System.out.println("x >>> 1    " + show(x >>> 1));
        System.out.println("x & (x-1)  " + show(x & (x - 1)) + "  lowest 1 cleared");
        System.out.println("x & -x     " + show(x & -x) + "  only the lowest 1");

        int mask = 1 << 4;
        System.out.println("bit 4 set? " + ((x & mask) != 0));
        System.out.println("set bit 1  " + show(x | (1 << 1)));
        System.out.println("clear bit 2 " + show(x & ~(1 << 2)));

        System.out.println("popcount   " + countBits(x)
                + "  and Integer.bitCount gives " + Integer.bitCount(x));

        System.out.println("-8 >> 1    " + (-8 >> 1));
        System.out.println("-8 >>> 1   " + (-8 >>> 1));
    }
}
\`\`\`

\`\`\`output @run-bit-manipulation-bits
x          00101100  = 44
x & 1      0  (odd?)
x >>> 1    00010110
x & (x-1)  00101000  lowest 1 cleared
x & -x     00000100  only the lowest 1
bit 4 set? false
set bit 1  00101110
clear bit 2 00101000
popcount   3  and Integer.bitCount gives 3
-8 >> 1    -4
-8 >>> 1   2147483644
\`\`\`

## Walking every subset

A set of \`n\` items has 2ⁿ subsets, and the numbers from 0 to 2ⁿ − 1 are exactly
those subsets written in binary: bit \`i\` set means item \`i\` is in. That turns
"try every subset" into a plain loop, which is why
[Subsets](problem:subsets) is filed here rather than under recursion.

\`\`\`java Subsets.java @run-bit-manipulation-subsets
import java.util.ArrayList;
import java.util.List;

public class Subsets {

    static List<List<Integer>> subsets(int[] a) {
        List<List<Integer>> out = new ArrayList<>();
        int total = 1 << a.length;            // 2^n

        for (int mask = 0; mask < total; mask++) {
            List<Integer> chosen = new ArrayList<>();
            for (int i = 0; i < a.length; i++)
                if ((mask & (1 << i)) != 0) chosen.add(a[i]);
            out.add(chosen);
        }
        return out;
    }

    public static void main(String[] args) {
        System.out.println(subsets(new int[] { 1, 2, 3 }));
        System.out.println("count for 4 items: " + subsets(new int[] { 1, 2, 3, 4 }).size());
    }
}
\`\`\`

\`\`\`output @run-bit-manipulation-subsets
[[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]]
count for 4 items: 16
\`\`\`

\`1 << n\` is 2ⁿ — but only up to n = 30 for an \`int\`, and \`1 << 31\` is negative.
For anything larger write \`1L << n\`. This is the second most common bug in the
topic after \`>>\` and it is silent.

## The XOR family

The single-number problems are a small ladder, and each rung teaches a different
use of XOR.

- **[Single Number](problem:single-number)** — everything twice except one. XOR
  the lot.
- **[Missing Number](problem:missing-number)** — XOR the values *and* the
  indices; every present number cancels with its index and the missing one is
  left.
- **[Single Number III](problem:single-number-iii)** — two singles. XOR
  everything to get \`a ^ b\`, take its lowest set bit with \`x & -x\` (a bit where
  the two differ), and split the array into two groups by that bit. Each group
  now has one single in it.
- **[Single Number II](problem:single-number-ii)** — everything three times
  except one. XOR does not help; count the 1s in each of the 32 positions and
  take each count modulo 3.

That last one is the general trick: **when values repeat k times, work column by
column and take the count modulo k.** It works for any k and needs no
cleverness.

## The mistakes, in the order people make them

1. **\`>>\` on a value used as bits.** Negative inputs make the loop never end.
   Use \`>>>\`.
2. **Precedence.** \`&\`, \`|\` and \`^\` bind *looser* than \`==\` in Java, so
   \`x & 1 == 0\` parses as \`x & (1 == 0)\` and does not compile. Always bracket:
   \`(x & 1) == 0\`.
3. **\`1 << 31\` and beyond.** Overflows an \`int\`. Use \`1L <<\` for 32 bits or more.
4. **Shifting by 32.** Java takes the shift count modulo 32 for \`int\`, so
   \`x << 32\` is \`x\`, not 0. Silent and surprising.
5. **\`~x\` is not \`-x\`.** \`~x\` is \`-x - 1\`.
6. **Confusing \`&\` with \`&&\`.** \`&\` on booleans works but does not short-circuit,
   so a null check written with \`&\` still dereferences.
7. **Forgetting \`char\` and \`boolean\` do not shift.** Cast to \`int\` first.

## The Java you will reach for

| You want | Write |
|---|---|
| Count the set bits | \`Integer.bitCount(x)\` |
| Highest set bit | \`Integer.highestOneBit(x)\` |
| Leading zeroes | \`Integer.numberOfLeadingZeros(x)\` |
| Trailing zeroes | \`Integer.numberOfTrailingZeros(x)\` |
| Reverse the bits | \`Integer.reverse(x)\` |
| As binary text | \`Integer.toBinaryString(x)\` |
| Parse binary | \`Integer.parseInt(s, 2)\` |
| A binary literal | \`0b1011\`, and \`_\` for grouping: \`0b1011_0110\` |
| The same for 64 bits | every one of the above on \`Long\` |

\`Integer.bitCount\` compiles to a single machine instruction on any modern
processor, so use it in real code. Write Kernighan's loop when the interview
asks you to show how it works.

## Working one from the sheet

[Counting Bits](problem:counting-bits): return an array where entry \`i\` is the
number of 1 bits in \`i\`, for every \`i\` from 0 to n.

Calling \`bitCount\` n times is O(n log n) and is not the intended answer. The
intended answer is to notice that \`i\` and \`i >>> 1\` differ by exactly one bit —
the one that was shifted off — so:

> bits(i) = bits(i / 2) + (the lowest bit of i)

Every answer is built from one already computed, which makes it O(n) and makes
this the smallest piece of dynamic programming on the whole sheet.

\`\`\`java CountingBits.java @run-bit-manipulation-counting-bits
import java.util.Arrays;

public class CountingBits {

    static int[] countBits(int n) {
        int[] bits = new int[n + 1];
        for (int i = 1; i <= n; i++)
            bits[i] = bits[i >>> 1] + (i & 1);
        return bits;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(countBits(16)));
    }
}
\`\`\`

\`\`\`output @run-bit-manipulation-counting-bits
[0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4, 1]
\`\`\`

The alternative recurrence, \`bits[i] = bits[i & (i - 1)] + 1\`, says the same
thing through the clear-the-lowest-bit idiom. Either is fine; being able to
derive one on the spot is the point.

## How to work through the topic

1. [Number of 1 Bits](problem:number-of-1-bits),
   [Hamming Distance](problem:hamming-distance),
   [Power of Two](problem:power-of-two). The three idioms, one each. Hamming
   distance is \`bitCount(a ^ b)\` once you see that XOR marks the differences.
2. [Single Number](problem:single-number),
   [Counting Bits](problem:counting-bits). XOR cancelling, and the recurrence.
3. [Reverse Bits](problem:reverse-bits). Loop thirty-two times, and mind the
   \`>>>\`.
4. [Sum of Two Integers](problem:sum-of-two-integers). Addition without \`+\`:
   XOR is the sum without carries, AND shifted left is the carry, repeat. The
   clearest demonstration on the sheet that arithmetic *is* bit manipulation.
5. [Single Number II](problem:single-number-ii),
   [Single Number III](problem:single-number-iii). The two harder XOR
   arguments.
6. [Subsets](problem:subsets),
   [Maximum Product of Word Lengths](problem:maximum-product-of-word-lengths).
   An integer as a set. The second one uses a 26-bit mask per word so that
   "do these two words share a letter" becomes one \`&\`.
7. [Maximum XOR of Two Numbers in an Array](problem:maximum-xor-of-two-numbers-in-an-array).
   Needs a [trie](#/dsa/tries/notes) over the bits. Come back after that topic.
`;export{e as default};