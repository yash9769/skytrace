// Edit this file to personalise the book.
// Put your photos in public/book/photos/ and reference them as "/book/photos/<file>".
// Leave `photo` empty to show a "your photo here" placeholder.

export type Sticker = "heart" | "stars" | "cupcake" | "favorite" | "envelope";

export type Chapter = {
  label: string; // small heading above the text
  text: string;
  photo?: string;
  sticker: Sticker;
  caption?: string; // written under the polaroid
};

export const book: {
  age: string;
  cover: { greeting: string[]; photo: string; caption: string };
  chapters: Chapter[];
} = {
  age: "20",
  cover: {
    greeting: [
      "Happy Birthday baby!",
      "Another year of being you, and",
      "somehow you keep making life a little",
      "better just by being in it. ♡",
    ],
    photo: "",
    caption: "I love you!",
  },
  chapters: [
    {
      label: "chapter one",
      text: "It's kind of funny how a whole year can pass without you even realizing it. There have been so many versions of us packed into these past few months: random plans, stupid jokes, quiet moments, and days that somehow became unforgettable.",
      sticker: "heart",
    },
    {
      label: "chapter two",
      text: "I hope today reminds you just how loved you are and how much brighter you make the lives of the people around you.",
      sticker: "stars",
    },
    {
      label: "chapter three",
      text: "I could keep a little box of everything from this year. It would probably be filled with blurry pictures, ridiculous conversations, tiny surprises, and all the moments that meant more than they seemed to at the time.",
      sticker: "cupcake",
    },
    {
      label: "chapter four",
      text: "For now, I just want you to enjoy being celebrated today because you absolutely deserve it.",
      sticker: "favorite",
    },
    {
      label: "chapter five",
      text: "Write a favourite memory here: the place, the day, the little detail only the two of you remember.",
      sticker: "heart",
    },
    {
      label: "chapter six",
      text: "And just like that, another little chapter becomes a memory. I hope you always remember how loved you are, not just today, but in all the ordinary moments in between. Whatever comes next, I'm really glad I get to be a part of it.",
      sticker: "envelope",
      caption: "here's to us",
    },
  ],
};
