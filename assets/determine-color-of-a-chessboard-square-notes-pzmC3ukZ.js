var e=`A square is named by a letter and a digit — \`a1\`, \`h3\`. Is it white? The board
is not stored anywhere and you are not asked to build it: the answer is decided
by the two characters you were handed, and the whole problem is noticing which
arithmetic they hide.

## How to approach it

**1. Draw four squares and label them.** \`a1\` is black. \`a2\`, \`b1\` are white.
\`b2\` is black. Two rows and two columns is enough to see the rule — the colour
flips with every step in either direction, which is what a chequerboard *is*.

**2. Say what "flips every step" means as arithmetic.** Something that alternates
as you add one is a question about **odd or even**. So the answer depends on the
parity of the column plus the row, and nothing else about them.

**3. Turn each character into a number.** The row is already a digit character.
The column is a letter, and turning a letter into its position is the same trick
as turning a digit character into its value: subtract the character it counts
from.

**4. Check your rule against one square you know**, not against the examples you
were given. \`a1\` is black, so \`1 + 1 = 2\` must come out as *not white*.

Nothing loops here. If you find yourself building a board, step back to step 2.

## The solution

\`\`\`java Chessboard.java @run-chessboard
public class Chessboard {

    static boolean byDigit(String coordinates) {
        char a = coordinates.charAt(0);
        int num_a = a - '0';
        char b = coordinates.charAt(1);
        int num_b = b - '0';
        int sum = num_a + num_b;

        if (sum % 2 != 0) {
            return true;
        }
        return false;
    }

    static boolean byLetter(String coordinates) {
        int col = coordinates.charAt(0) - 'a' + 1;
        int row = coordinates.charAt(1) - '0';

        return (col + row) % 2 != 0;
    }

    public static void main(String[] args) {
        for (String c : new String[] { "a1", "h3", "c7", "d5", "h8" })
            System.out.printf("%s   'a'-'0' %-6b  'a'-'a'+1 %b%n", c, byDigit(c), byLetter(c));
    }
}
\`\`\`

\`\`\`output @run-chessboard
a1   'a'-'0' false   'a'-'a'+1 false
h3   'a'-'0' true    'a'-'a'+1 true
c7   'a'-'0' false   'a'-'a'+1 false
d5   'a'-'0' true    'a'-'a'+1 true
h8   'a'-'0' false   'a'-'a'+1 false
\`\`\`

Both columns agree on every square, and the first one has no business doing so —
\`a - '0'\` on a *letter* is subtracting the wrong character. It is worth
understanding exactly why it still passes, because the reason is a real fact and
the habit is a bad one.

## Why subtracting \`'0'\` from a letter still works

\`'a'\` is 97 and \`'0'\` is 48, so \`'a' - '0'\` is **49** where the column is really
**1**. Every column is 48 too big.

![Two ways of numbering the column, 48 apart, and why the parity does not notice](diagrams/determine-color-of-a-chessboard-square-notes-parity.jpg)

And 48 is even. Adding an even number to something never changes whether it is
odd or even — so a test that only asks *is the sum odd* cannot tell the two
numberings apart. The first version computes the wrong column and then asks a
question the wrongness does not reach.

That makes it correct and unexplainable, which is the worst combination to leave
in a file. \`- 'a' + 1\` says *this is the column, counting from 1*; \`- '0'\` says
nothing, and the next reader — including you — has to redo the parity argument
above to convince themselves it is not a bug. Write the second one.

The one that is genuinely worth keeping from both is \`char - char\`: characters
are numbers, and subtracting the start of a run gives you the position in it.
\`'7' - '0'\` is 7 and \`'c' - 'a'\` is 2, for exactly the same reason.

## Time — O(1)

Two character reads, a subtraction each, one addition, one remainder. Nothing
here is a loop and nothing depends on how big the board is.

![Constant work per square, however many squares the board has](diagrams/determine-color-of-a-chessboard-square-notes-cost.jpg)

Space is the same story: two \`int\`s and no structure. Had the problem asked you
to colour the whole board it would be O(n²) to build one — which is exactly the
solution the arithmetic saves you from writing.

| | Cost | Why |
|---|---|---|
| Time | O(1) | two reads and one remainder |
| Space | O(1) | two \`int\`s, no board built |
`;export{e as default};