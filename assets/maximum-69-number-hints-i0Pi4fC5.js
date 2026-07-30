var e=`Read one, close the page, go back to the editor. They are in order and they stop
before the answer.

## Before any hint at all

Write 9669 down and list every number you could reach by changing one digit.
There are four. Circle the biggest. Then do the same for 9996 and for 9999 — the
third one is the case most solutions forget.

## 1. Half the moves are never worth making

You may change a 6 to a 9 or a 9 to a 6, and you are asked for the **largest**
result. One of those two directions can be crossed off the list without any
further thought.

## 2. Which 6, then?

You are allowed one change, and a number has several sixes. Look at what each
one is *worth* — the 6 in the hundreds column and the 6 in the tens column are
not the same 6. You do not need to compare candidates once you have seen this;
the position alone decides it.

## 3. "At most one"

Read that phrase again and ask what it lets you do that "exactly one" would not.
There is an input in your list from the first step that depends on it.

## 4. Reaching the digits

Two honest routes. Text — turn the number into characters, change one, turn it
back — or the digit loop this topic is built on. Write the text one first; it is
correct and it is fast to get right.

## 5. The one-liner, and the trap in it

Java's \`String\` has a method that replaces the *first* occurrence of something,
and this problem is exactly that method's job. Its sibling replaces *every*
occurrence, and choosing the wrong one gives 9999 for 9669 — a plausible-looking
answer that is wrong.

If you write the loop version instead, the same trap is a missing \`break\`.

## 6. If none of that was enough

One change, in the leftmost 6, and stop. Both versions, the regex caveat, and
the memory each of them costs are on the **Notes** tab.
`;export{e as default};