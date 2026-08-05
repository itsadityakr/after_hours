var e=`Read one, close the page, go back to the editor. They are in order and they stop
before the answer.

## Before any hint at all

Write the shape out for \`n = 4\` on paper and count the stars on each row. Then
say the relationship between the two numbers you wrote per row — the row number
and the star count — out loud. It is the shortest sentence on the pattern sheet.

## 1. Two loops, and which is which

One loop cannot do this: you need something that repeats per **row**, and inside
it something that repeats per **star in that row**.

Write the outer loop first, with an empty body, and make it run \`n\` times. Do not
put anything inside it yet.

## 2. Where does the newline go?

Before you write the inner loop, decide where the line break belongs. Ask: how
many newlines does the finished picture contain, and how many rows are there?

Two numbers that are equal means the newline belongs to the loop that runs that
many times. Put it there now, before the inner loop exists, and you will never
have to debug it.

## 3. The inner loop's bound is not \`n\`

If the inner loop runs \`n\` times you get a square. Look at your paper again: on
row 3 the inner loop must run three times, on row 4 four times.

So the inner bound is not a constant at all — it is **the outer loop's
variable**. That is the whole trick of this problem and of every pattern after it.

## 4. Print without moving to the next line

There are two printing methods and they differ by exactly one thing. Use the one
that does *not* end the line for the star, and the one that does for the end of
the row. Getting these the wrong way round produces one star per line, which is a
tall thin triangle and an obvious symptom.

## 5. Check the two ends

Run it for \`n = 1\` and for \`n = 5\`. If \`n = 1\` prints one star and a newline and
nothing else, your bounds are right. If the last row has \`n\` stars rather than
\`n - 1\` or \`n + 1\`, your comparison is right.

## 6. If it is a square instead of a triangle

Your inner bound is \`n\`. If it is a single column, your \`println\` is inside the
inner loop. If it is one long line, you have no \`println\` at all. Those three
symptoms cover almost every wrong version of this.

## 7. Now say what would change for the other shapes

Without writing them: what single thing would you change to get an upside-down
version? What would you add to push the triangle to the right? You should be able
to answer both in one sentence each, because every other pattern is this loop
with a different inner bound.

## 8. If none of that was enough

The loop, a dry run of the grid it walks, why the newline goes where it does, and
what the shape costs are on the **Notes** tab.
`;export{e as default};