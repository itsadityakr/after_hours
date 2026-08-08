var e=`This one is not hard because of the loop. It is hard because the six subtractive
pairs look like exceptions, and everything you write while you believe that is
longer than it needs to be.

## Before any hint at all

Write these out by hand, on paper, and note how long each one takes you:

\`\`\`text
4      9      40      90      400      900      1994      3749
\`\`\`

Now say, in one sentence, what \`4\` and \`40\` and \`400\` have in common that \`3\`
and \`30\` and \`300\` do not. Whatever you wrote is the thing the rest of these
hints are about.

## 1. Say what the rule actually is

You know two rules. Say both, precisely.

- The one about writing symbols largest first and adding them up.
- The other one.

For the second, write down **every** pair it applies to. Not a description —
the actual list. If your list has more than six entries, one of them is wrong:
check \`IL\`, \`IC\` and \`XD\` against the problem statement.

The fact that the list is *finite and short* is the whole problem. Sit with that
before continuing.

## 2. Write the version you already know is clumsy

Handle the seven ordinary symbols with a loop or a chain of conditions, and put
the six pairs in as special cases wherever they need to go.

Write it. Make it pass. It will be about twenty lines and it will be correct.

Do this before reading on, because the argument in the next hints is with a
thing that exists rather than with a thing you imagined.

## 3. Time it, so you know the rewrite is not about speed

How many times does your loop run, worst case, over the whole input range?

Work out the longest numeral between 1 and 3999 and count its characters. Then
say what upper bound that puts on the loop.

You should conclude that the answer is *tiny* and fixed. Write that number down.
The rewrite that follows is **not** a performance fix, and being clear about
that now stops you looking for the wrong improvement.

## 4. Look at your branches sideways

Take your twenty lines and, for each branch, write down only two things:

\`\`\`text
the number it compares against      the text it appends
\`\`\`

Do not write anything else. Just those two columns, one row per branch.

Now count the rows, and look at what is left of the code once those two columns
are removed from it. How much of each branch was actually *different*?

## 5. The two columns are the answer

You have a table. Put it in the program.

Two arrays, same length, matching positions — or one array of pairs if you
prefer. Then ask: what is the smallest loop that can walk that table and produce
the answer?

Write it. It is two nested loops and no conditions at all beyond the loop tests.

## 6. Get the order right, and know why

Your table has to be in one particular order, and if you get it wrong the code
still compiles and still produces plausible output.

Say what the order is, and then find the input that proves it: pick a number
that comes out wrong if \`500\` sits above \`900\` in your table, and check what
your code gives for it.

That input is the test worth keeping.

## 7. What the inner loop is for

You now have an outer loop over the table and an inner loop that repeats.

Answer these two without running anything:

- Which table entries can the inner loop ever fire more than once for?
- Which ones can it never fire more than once for, and why?

The second answer is the reason the subtractive pairs need no special handling —
and it is the sentence to have ready when somebody asks you why \`CM\` is not a
special case.

## 8. The last check

Run 3999 and 1 through it.

Then say what would have to change if the constraint were \`num <= 3999999\`, and
whether your table version or your twenty-line version would be easier to
change. That comparison is the whole reason for the rewrite, and it is the
answer to "why did you do it that way" in an interview.
`;export{e as default};