var e=`Count from 1 to \`n\`. Say \`Fizz\` for a multiple of three, \`Buzz\` for a multiple
of five, \`FizzBuzz\` for a multiple of both, and otherwise the number itself.
Nothing is hidden in it — it is first on the sheet because it checks one thing
only, that you can take a rule written in English and write the loop that obeys
it.

## How to approach it

This is the first problem on the sheet and the method below is worth more than
the answer to it, because it is the same method for every problem after it.

**1. Do it by hand first.** Write out the answers for 1 to 15 on paper. Not
because it is hard — because until you have, you are writing code for a rule you
have only read. Doing it by hand is also how you find 15, which is the only
interesting number in the problem.

**2. Say the rule out loud, in the order you actually apply it.** "If it divides
by both, say FizzBuzz; otherwise if it divides by three, say Fizz; otherwise if
by five, Buzz; otherwise the number." That sentence is the program. Most of what
looks like coding is really this step done badly.

**3. Ask what you are looping over and how many answers there are.** One answer
per number from 1 to \`n\`, so: one loop, \`n\` passes, one thing added per pass.
That decision — what the loop counts — is the one that fixes the shape.

**4. Ask what one pass has to do.** Decide which of four words, then record it.
Nothing else.

**5. Write it, then run it on the smallest input that can go wrong.** For this
problem that is \`n = 15\`, not \`n = 5\`. The smallest input that exercises the
tricky case is the test worth having.

**6. Only then ask what it costs.** How many times does the loop run, and how
much memory does the answer need — the two sections at the bottom of this page.

If you are stuck on step 2, **Hints** in the bar is that sentence handed to you
one clause at a time, with nothing given away past the clause you asked for.

## The loop

\`\`\`java FizzBuzz.java @run-fizz-buzz
import java.util.ArrayList;
import java.util.List;

public class FizzBuzz {

    static List<String> fizzBuzz(int n) {
        List<String> out = new ArrayList<>();
        for (int i = 1; i <= n; i++) {
            if (i % 3 == 0 && i % 5 == 0) {
                out.add("FizzBuzz");
            } else if (i % 3 == 0) {
                out.add("Fizz");
            } else if (i % 5 == 0) {
                out.add("Buzz");
            } else {
                out.add(Integer.toString(i));
            }
        }
        return out;
    }

    public static void main(String[] args) {
        System.out.println(String.join(" ", fizzBuzz(15)));
    }
}
\`\`\`

\`\`\`output @run-fizz-buzz
1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz
\`\`\`

On the judge this sits inside \`class Solution\` with the method public and
nothing else changed. \`%\` here is not the digit trick — \`i % 3 == 0\` is the
other question the operator answers, *does three divide i exactly*.

Three things in that loop are worth saying out loud.

**The counter starts at 1, not 0.** The problem counts from one, and \`0 % 3\` is
0 — start at zero and the first thing in the list is \`FizzBuzz\`, for a number
that is not part of the answer at all.

**The combined case is tested first, and it has to be.** An \`else if\` chain
stops at the first branch that matches, so whichever test comes first owns every
number it claims.

**The last branch converts, it does not append.** The list is \`List<String>\`, so
the number has to become text: \`Integer.toString(i)\`. \`String.valueOf(i)\` is the
same call under another name, and \`i + ""\` is the same thing written so that it
looks like arithmetic.

## The order of the tests

Fifteen is a multiple of three *and* of five. Put \`i % 3 == 0\` in front and
fifteen is answered \`Fizz\`, the rest of the chain is never reached, and
\`FizzBuzz\` never appears in the output at all. The first value that exposes it
is 15, which is past the end of the run most people do in their head.

The single remainder \`i % 15 == 0\` is the same test as \`i % 3 == 0 && i % 5 == 0\`,
because three and five share no factor and a number divisible by both is
divisible by their product. The pair reads closer to the rule as it was stated,
which is why the code above keeps it; the single remainder is one operation
cheaper and neither will ever be why a submission is slow. What matters is only
that whichever you write is written first.

![The Fizz Buzz branch chain, and what happens to 15 when the combined test is not first](diagrams/fizz-buzz-notes-order.jpg)

When the rule grows a third word — three, five and seven — the chain grows to
eight branches, and that is the point at which choosing a word stops being the
right shape. Building one does not grow:

\`\`\`java
String word = "";
if (i % 3 == 0) word += "Fizz";
if (i % 5 == 0) word += "Buzz";
out.add(word.isEmpty() ? Integer.toString(i) : word);
\`\`\`

Same output, and the combined case is no longer a case — it falls out of two
independent tests. Know it, and do not reach for it first: with two words the
chain is plainer, and plainer is what is being read for.

## Time — O(n)

Nothing inside the loop depends on \`n\`: two remainders, a comparison, one
\`add\`. A fixed amount of work done \`n\` times is a straight line.

![The straight line the Fizz Buzz loop follows: passes rising in step with n](diagrams/fizz-buzz-notes-time.jpg)

\`ArrayList.add\` does not bend it — the backing array doubles and the copies come
to less than 2n over the whole run, which is what *amortised* O(1) means. Nor
can anything beat it: the answer has \`n\` entries, so producing it takes at least
\`n\` steps.

## Space — O(n) returned, O(1) used

The list is \`n\` strings, and it is the answer rather than working memory. What
the loop adds on top of it is \`i\` — no second array, no map, no recursion stack.

![The Fizz Buzz list growing linearly while the memory the loop itself uses stays flat](diagrams/fizz-buzz-notes-space.jpg)

Print each line instead of returning them and the blue line goes away: the same
loop is O(1) space.

| | Cost | Why |
|---|---|---|
| Time | O(n) | one pass per number, constant work in each |
| Space, returned | O(n) | \`n\` strings, and they are the answer |
| Space, used | O(1) | one \`int\` counter |
`;export{e as default};