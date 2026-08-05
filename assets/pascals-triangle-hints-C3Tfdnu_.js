var e=`Read one, close the page, go back to the editor. They are in order and they stop
before the answer.

## Before any hint at all

Write rows 0 to 3 on paper and put row 4 underneath by hand. Then say out loud
where each of its five numbers came from. Nearly everything below is that
sentence made precise, and if you cannot say it about \`6\` you are not stuck on
code.

## 1. Two facts about a row, before any arithmetic

How many numbers does row \`i\` hold? And which of them do you already know without
adding anything at all? Answer those two and you have both loop bounds and the
base case, without having thought about the rule yet.

Watch the second loop's comparison in particular. There is one row of the
triangle where the two answers you just gave refer to the same single cell, and
that row is the one everybody's first attempt gets wrong.

## 2. The rule, with indices on it

The cell at \`(i, j)\` has two parents. Both are in row \`i - 1\`, so write them as
\`(i - 1, ?)\` and \`(i - 1, ?)\` and fill in the two columns.

Now check your answer against a fact you already have: row \`i - 1\` is one shorter
than row \`i\`. Only one pair of columns stays inside it for every interior \`j\`.
Reading the wrong pair is the single most common way to lose this problem, and it
does not fail until the last cell of a row.

## 3. If you reached for recursion, count the calls

A cell is the sum of two cells, each of which is the sum of two cells. Written
that way it is three lines and it is correct, so nothing will tell you it is
wrong.

Put a counter on the function and print it for 20 rows, then for 25. The count
roughly doubles for every row you add. The triangle for 30 rows has 465 cells in
it. Hold those two numbers next to each other before reading on.

## 4. Ask where the repeats are coming from

Take two neighbouring cells in one row and write down what each of them recurses
into. They have a parent in common. Neither knows the other exists, so everything
underneath that shared parent is explored twice — and that happens again at every
level below it.

## 5. You are already storing the answer

Whatever you are collecting the triangle into holds row \`i - 1\`, finished and
correct, by the time you start row \`i\`. Reading a value out of it is one
operation.

That is the entire fix. No memo table, no map, no second pass — the structure you
were going to return anyway is the cache.

## 6. Two questions about order

A fresh list for each row, or one list reused? Try the reused version and print
the result before deciding; the failure is instructive and it is not an exception.

And do you add the row to the answer before filling it or after? One of the two
reads as if the loop were editing something already published.

## 7. Now do it without looking at the row above

Count paths instead of adding numbers. Start at the top and walk down to a cell:
at every step you go left or right, and after \`i\` steps you have landed
somewhere. How many different routes end at column \`j\`?

That is a number with a name, and it means a cell can be computed from \`i\` and
\`j\` alone.

## 8. Walking a row without factorials

Do not compute each of those from scratch — factorials overflow and it is slower
than the thing you already have. Write two consecutive entries of a row as
products and divide one by the other. What is left is one multiplication and one
division.

## 9. The order of that multiply and divide is not free

One order keeps every intermediate a whole number for the length of the row; the
other truncates on about the second entry and the error is carried into every
one after it.

Work out which, and be ready to say why the division comes out exact — the
argument is one sentence about what the result of it is.

## 10. If none of that was enough

The recursion and what it actually costs, the row-from-row solution explained
line by line, the running formula and where it does and does not help are on the
**Notes** tab.
`;export{e as default};