var e=`Read one, close the page, go back to the editor. They are in order and they stop
before the answer.

## Before any hint at all

Draw a 2×2 corner of the board and label the squares \`a1\`, \`a2\`, \`b1\`, \`b2\`.
Colour them. Now say out loud what happens to the colour when you move one
square right, and what happens when you move one square up.

## 1. You are not being asked to build a board

There is no array in this problem. You are handed two characters and asked one
yes-or-no question about them — if your plan has a loop in it, the plan is
bigger than the problem.

## 2. What alternates every single step?

Right by one flips it. Up by one flips it. Something that flips on every step of
a count is a question about the count being **odd or even** — and you already
know the operator that answers that.

## 3. Two moves that both flip it

Moving one right flips the colour and moving one up flips it too. So moving
diagonally flips it twice, which is to say not at all. What single number about
the square could behave like that? Add the two coordinates together and look at
what you get for \`a1\`, \`a2\`, \`b1\`, \`b2\`.

## 4. Turning the characters into numbers

The row is a digit character, and this topic's own notes have the trick for
those. The column is a letter, and the trick is the same one: subtract the
character the run starts from. \`'c' - 'a'\` is 2 for exactly the reason \`'7' -
'0'\` is 7.

Whether you count columns from 0 or from 1 changes the answer, so check your
choice against a square whose colour you already know.

## 5. If you subtracted the wrong character and it still passed

That happens, and it is not luck exactly. Work out the two numbers you would get
for column \`a\` under both, and then ask what the difference between them does to
*odd or even*. Understanding that is worth more than the problem was.

## 6. If none of that was enough

The whole thing is one addition and one remainder. Both versions, and why the
wrong-looking one still passes, are on the **Notes** tab.
`;export{e as default};