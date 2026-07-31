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
much memory does the answer need — the section at the bottom of this page.

If you are stuck on step 2, **Hints** in the bar is that sentence handed to you
one clause at a time, with nothing given away past the clause you asked for.

## Approach 1 — the branch chain

\`\`\`java FizzBuzz.java @run-fizz-buzz-fizz-buzz
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
\`\`\`

\`\`\`output @run-fizz-buzz-fizz-buzz
String.join(" ", fizzBuzz(15)) -> 1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz
String.join(" ", fizzBuzz(5))  -> 1 2 Fizz 4 Buzz
fizzBuzz(1)                    -> [1]
\`\`\`

\`\`\`demo FizzBuzz.java
String.join(" ", fizzBuzz(15))
String.join(" ", fizzBuzz(5))
fizzBuzz(1)
\`\`\`

On the judge this sits inside \`class Solution\` with the method public and
nothing else changed. \`%\` here is not the digit trick — \`i % 3 == 0\` is the
other question the operator answers, *does three divide i exactly*.

![One pass of the branch chain, for a number that matches and one that does not](diagrams/fizz-buzz-notes-a1-pass.jpg)

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

## Approach 2 — build the word instead of choosing it

When the rule grows a third word — three, five and seven — the chain grows to
eight branches, and that is the point at which *choosing* a word stops being the
right shape. Building one does not grow.

\`\`\`java FizzBuzzBuild.java @run-fizz-buzz-fizz-buzz-build
static List<String> fizzBuzz(int n) {
    List<String> out = new ArrayList<>();

    for (int i = 1; i <= n; i++) {
        String word = "";
        if (i % 3 == 0) word += "Fizz";
        if (i % 5 == 0) word += "Buzz";

        out.add(word.isEmpty() ? Integer.toString(i) : word);
    }
    return out;
}
\`\`\`

\`\`\`output @run-fizz-buzz-fizz-buzz-build
String.join(" ", fizzBuzz(15)) -> 1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz
String.join(" ", fizzBuzz(5))  -> 1 2 Fizz 4 Buzz
fizzBuzz(1)                    -> [1]
\`\`\`

\`\`\`demo FizzBuzzBuild.java
String.join(" ", fizzBuzz(15))
String.join(" ", fizzBuzz(5))
fizzBuzz(1)
\`\`\`

Same output, and the combined case is no longer a case — it falls out of two
independent tests that both happen to fire. A seventh word is one more \`if\`
rather than four more branches.

![The word being built from two independent tests rather than chosen from four branches](diagrams/fizz-buzz-notes-a2-build.jpg)

Know it, and do not reach for it first: with two words the chain is plainer, and
plainer is what is being read for. Reach for it the moment a follow-up adds a
third word, and say why as you do.

## Approach 3 — without \`%\` at all

The classic follow-up: no division, no remainder. Count how long it has been
since the last multiple instead, and reset when you arrive.

\`\`\`java FizzBuzzCount.java @run-fizz-buzz-fizz-buzz-count
static List<String> fizzBuzz(int n) {
    List<String> out = new ArrayList<>();
    int three = 0;
    int five = 0;

    for (int i = 1; i <= n; i++) {
        three++;
        five++;

        String word = "";
        if (three == 3) {
            word += "Fizz";
            three = 0;
        }
        if (five == 5) {
            word += "Buzz";
            five = 0;
        }

        out.add(word.isEmpty() ? Integer.toString(i) : word);
    }
    return out;
}
\`\`\`

\`\`\`output @run-fizz-buzz-fizz-buzz-count
String.join(" ", fizzBuzz(15)) -> 1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz
String.join(" ", fizzBuzz(5))  -> 1 2 Fizz 4 Buzz
fizzBuzz(1)                    -> [1]
\`\`\`

\`\`\`demo FizzBuzzCount.java
String.join(" ", fizzBuzz(15))
String.join(" ", fizzBuzz(5))
fizzBuzz(1)
\`\`\`

Two counters, each reset the moment it reaches its own number. It is the same
\`O(n)\` and it is not faster in any way you could measure — what it demonstrates
is that "divisible by three" and "every third one" are the same statement, and
that a remainder is one way to ask the question rather than the only one.

![Two counters climbing and resetting instead of a remainder being taken](diagrams/fizz-buzz-notes-a3-counters.jpg)

**Both counters have to be tested, not one or the other.** Written as an
\`else if\` this would fail on 15 for exactly the reason approach 1 fails when the
combined case is not first — and here there is no combined case to put in front.

## What the three cost

**Time is the yellow line, memory the green one.** All three make one pass per
number with a fixed amount of work in each, so there is one yellow line for all
of them — this problem has no faster answer.

![Time and memory for all three versions on one pair of axes](diagrams/fizz-buzz-notes-cost.jpg)

| Approach | Time | Space | |
|---|---|---|---|
| 1 — branch chain | O(n) | O(n) returned, O(1) used | **write this one** |
| 2 — build the word | O(n) | O(n) returned, O(1) used | the one that survives a third word |
| 3 — counters, no \`%\` | O(n) | O(n) returned, O(1) used | for the "without division" follow-up |

\`ArrayList.add\` does not bend the line — the backing array doubles and the
copies come to less than 2n over the whole run, which is what *amortised* O(1)
means. Nor can anything beat it: the answer has \`n\` entries, so producing it
takes at least \`n\` steps.

The memory splits in two, and the split is worth stating in an interview. The
list is \`n\` strings and it is **the answer**, not working memory; what the loop
adds on top of it is a counter or two. Print each line instead of returning them
and the rising green line goes away — the same loop is then O(1) space.
`;export{e as default};