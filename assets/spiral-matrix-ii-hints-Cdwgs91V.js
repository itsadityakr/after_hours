var e=`Read one, close the page, go back to the editor. They are in order and they stop
before the answer.

## Before any hint at all

Draw the 4 by 4 on paper and number all sixteen cells. Then mark every place the
direction changes. There are eight of them, and once you can say where they are
without counting you have most of this problem.

## 1. Say what one straight run is

Not "the spiral" — one **side**. A single run that fills a whole row, or a whole
column, between two limits.

Write down the two limits for the top side of the outer ring. If you can do that,
you have written your first \`for\` loop, and the other three sides are the same
sentence rotated.

## 2. Ask what changes when a side is finished

The top row is now full, so the part of the grid still needing numbers starts one
row lower. Say that as an assignment.

Do it for all four sides and count how many variables you ended up with. It
should be four, and none of them is a position.

## 3. Notice what you did not need

No current row, no current column, no direction, no turning rule. The order you
write the four loops in **is** the direction. That is the whole idea, and if you
have got here the code is close.

## 4. Now decide when to stop

The grid is finished when the region described by your four variables has nothing
in it. That is two comparisons, and both are needed — work out why one is not
enough by imagining a grid that is wider than it is tall.

## 5. The one that bites: when does a wall move?

Straight after its own side, or all four together at the end of the ring? Try the
second on the 3 by 3 and look at what happens to the corners.

This is the single most common way to get a matrix out with a number missing from
it, and it does not throw.

## 6. Two of the loops count downwards

The bottom side runs right to left and the left side runs bottom to top. Get the
start, the end and the comparison right for both — and check whether the corner
cell belongs to the side before or the side after.

## 7. Trace the odd case slowly

\`n = 3\`. Walk your code by hand to the very last cell, writing the four variables
down after every side. If the centre gets written twice, one of your walls moved
at the wrong moment.

## 8. If you wrote the direction-vector version instead

That is fine, it works. But look hard at the test you use to decide whether to
turn. One clause of it reads the matrix and asks whether a cell is still zero —
and that only tells you anything because this problem never stores a zero.

Ask what you would do if the grid already held numbers and 0 was one of them.
That is [Spiral Matrix](problem:spiral-matrix), and the answer costs you an
\`n × n\` array of booleans that the four-variable version does not need.

## 9. Then check whether your guards are needed

If you wrote an \`if\` in front of the third and fourth sides, work out whether it
ever fires on a square. Then run the same code on three rows by five columns and
work out whether it fires there.

The answer is different in the two cases, and knowing which is which is what the
follow-up question is about.

## 10. If none of that was enough

Both versions, why the wall has to move immediately, a dry run of the 4 by 4 side
by side, and what the guards do on a square against a rectangle are on the
**Notes** tab.
`;export{e as default};