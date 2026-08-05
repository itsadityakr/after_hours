var e=`A square is named by a letter and a digit — \`a1\`, \`h3\`. Is it white? The board is
not stored anywhere and you are not asked to build it: the answer is decided by
the two characters you were handed.

## 1. The problem

Given a two-character string naming a chessboard square, return \`true\` if that
square is white.

- **In** — \`coordinates\`, a \`String\` of length exactly 2: a letter \`a\` to \`h\`,
  then a digit \`1\` to \`8\`.
- **Out** — \`boolean\`, \`true\` for white.
- **Guaranteed** — the input is always valid, so there is nothing to validate.

**\`a1\` is black.** That is the fact the whole answer is calibrated against, and
it is worth writing on the paper before anything else — get it inverted and every
single answer is inverted with it.

Nothing here needs a board. Two rows and two columns is enough to see the rule:

\`\`\`text
     a    b
  2  W    B
  1  B    W
\`\`\`

The colour flips with every step in either direction, which is what a
chequerboard *is*.

## 2. The brute force

Turn the two characters into numbers, add them, and look at whether the total is
odd or even.

\`\`\`java Chessboard.java @run-determine-color-of-a-chessboard-square-chessboard
static boolean squareIsWhite(String coordinates) {

    int col = coordinates.charAt(0) - 'a' + 1;
    int row = coordinates.charAt(1) - '0';

    return (col + row) % 2 != 0;
}
\`\`\`

\`\`\`output @run-determine-color-of-a-chessboard-square-chessboard
squareIsWhite("a1") -> false
squareIsWhite("a2") -> true
squareIsWhite("b1") -> true
squareIsWhite("b2") -> false
squareIsWhite("h3") -> true
squareIsWhite("h8") -> false
squareIsWhite("c7") -> false
\`\`\`

\`\`\`demo Chessboard.java
squareIsWhite("a1")
squareIsWhite("a2")
squareIsWhite("b1")
squareIsWhite("b2")
squareIsWhite("h3")
squareIsWhite("h8")
squareIsWhite("c7")
\`\`\`

### The code, line by line

- \`coordinates.charAt(0) - 'a' + 1\` — the file letter as a number. Subtracting
  \`'a'\` from a letter gives its distance from \`a\`, so \`a\` becomes 0 and \`h\`
  becomes 7; the \`+ 1\` shifts it to 1 to 8 so it counts the way the rank does.
  **Java does this arithmetic on the character's code point** — there is no
  conversion function needed and none should be reached for.
- \`coordinates.charAt(1) - '0'\` — the rank digit as a number, by the same trick.
  \`'3' - '0'\` is 3, because the digit characters are consecutive in the encoding.
  This is the standard way to turn a digit character into its value, and it is
  worth knowing rather than \`Integer.parseInt\` on a one-character substring.
- \`(col + row) % 2 != 0\` — **the whole rule.** A step in any direction changes
  exactly one of the two numbers by one, so it flips the parity of their sum.
  Colour alternates, parity alternates, so colour *is* parity.
- \`!= 0\` rather than \`== 0\` — this is where \`a1\` is being honoured. For \`a1\` the
  sum is \`1 + 1 = 2\`, which is even, and \`a1\` is black — so **even means black**
  and white is the odd case.

## 3. Dry run of the brute force

The four squares of the bottom-left corner, which is all it takes to prove the
rule.

| input | charAt(0) | col | charAt(1) | row | col + row | odd? | returns | correct? |
|---|---|---|---|---|---|---|---|---|
| \`a1\` | \`a\` | 1 | \`1\` | 1 | 2 | no | \`false\` | black ✓ |
| \`a2\` | \`a\` | 1 | \`2\` | 2 | 3 | yes | \`true\` | white ✓ |
| \`b1\` | \`b\` | 2 | \`1\` | 1 | 3 | yes | \`true\` | white ✓ |
| \`b2\` | \`b\` | 2 | \`2\` | 2 | 4 | no | \`false\` | black ✓ |
| \`h3\` | \`h\` | 8 | \`3\` | 3 | 11 | yes | \`true\` | white ✓ |

The board with its sums written in, coloured by what the method returns:

![3. Dry run of the brute force — diagram](diagrams/determine-color-of-a-chessboard-square-notes-mm-1.jpg)

**Read any row across: the sums go 2, 3, 4, 5 and the colours alternate with
them.** Read any column up: same thing. That is the entire proof — one step in
either direction changes the sum by exactly 1, and changing a number by 1 always
flips whether it is odd.

The corner check that catches an inverted answer:

| square | sum | parity | colour |
|---|---|---|---|
| \`a1\` — bottom-left | 2 | even | **black** |
| \`h8\` — top-right | 16 | even | **black** |

Both corners on that diagonal are black, which is a real property of a chessboard
and a free test of your arithmetic. **If your method says \`a1\` is white, the
comparison is the wrong way round** — and every other answer is wrong too, which
makes it the fastest bug on the sheet to spot and the easiest to ship.

## 4. Why it is not enough

It is enough. Time is O(1) and space is O(1) — two character reads, one addition
and one remainder, whatever the input. There is no \`n\` here at all.

What is left is only how much of the arithmetic you can drop, and there is more
than it looks. Notice that the \`+ 1\` on the column and the \`- '0'\` on the row
cancel out against each other in the parity: adding a constant to both sides
changes the sum by a constant, and **an even constant does not change the parity
at all**.

So the shifts are not carrying their weight. \`'a'\` and \`'0'\` are fixed numbers;
subtracting them from the two characters shifts the sum by a fixed amount, and if
that amount happens to be even you can simply not do it. Add the two *characters*
directly and check the parity of that — one expression, no conversion, same
answer.

Work out whether \`'a' + '0'\` is odd or even and you will know both whether that
shortcut works and whether it inverts the comparison. That is the follow-up, and
it is a question about the character encoding rather than about chess.

## 5. Key takeaways

- **A chequerboard is parity.** Every step in any direction flips the colour, and
  the only thing that behaves that way is odd-versus-even.
- **\`a1\` is black.** Calibrate against it, because getting it backwards inverts
  every answer at once and nothing else will look wrong.
- **\`c - 'a'\` and \`c - '0'\` are the standard character-to-number moves.** Java
  does the arithmetic on code points, so no parse function is needed.
- **Both corners of the long diagonal are black** — \`a1\` sums to 2, \`h8\` to 16.
  A free correctness test you can do in your head.
- **O(1) time and space**, with no board built and no loop written. If you find
  yourself constructing an 8 × 8 array, re-read the question.
- **Adding an even constant to both sides changes nothing about parity**, which
  is the door to the shorter version.
`;export{e as default};