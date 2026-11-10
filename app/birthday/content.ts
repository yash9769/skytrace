// Edit this file to personalise the book.
// Photos live in public/book/photos/ and are referenced as "/book/photos/<file>".
// `pos` is the CSS object-position used when the photo is cropped to fit its frame.

export type Sticker = "heart" | "stars" | "cupcake" | "favorite" | "envelope";

export type Chapter = {
  num: string; // small line above the title
  title: string; // script heading
  text: string;
  photo?: string;
  pos?: string;
  sticker: Sticker;
  caption?: string; // written under the polaroid
};

export const book: {
  age: string;
  cover: { greeting: string[]; photo: string; pos?: string; caption: string };
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
    photo: "/book/photos/cover-walk.jpg",
    pos: "50% 72%",
    caption: "I love you!",
  },
  chapters: [
    {
      num: "Chapter 01",
      title: "The beginning",
      text: "Who knew our random chats, endless Haa, Achaaa and Okayyy would become such a beautiful part of our lives? ❤️",
      photo: "/book/photos/ch1-thane.jpg",
      pos: "50% 38%",
      sticker: "heart",
    },
    {
      num: "Chapter 02",
      title: "Our language",
      text: "From addressing each other as Mis Mansi and Mr. Das to calling each other Mithudiiiii, Doba, Chatora and Chatori! What a fun journey it's been! 😂❤️",
      photo: "/book/photos/ch2-balcony.jpg",
      pos: "50% 62%",
      sticker: "stars",
    },
    {
      num: "Chapter 03",
      title: "Little surprises",
      text: "You always say 'no gifts,' but seeing your smile is worth breaking every rule. Some smiles are just too precious not to miss! ❤️",
      photo: "/book/photos/ch3-surprise.jpg",
      pos: "50% 62%",
      sticker: "cupcake",
    },
    {
      num: "Chapter 04",
      title: "Little adventures",
      text: "From train timings and platforms to getting home safe, and dreaming up random trips—every little moment with you has become my favorite memory ❤️",
      photo: "/book/photos/ch4-train.jpg",
      pos: "60% 50%",
      sticker: "heart",
    },
    {
      num: "Chapter 05",
      title: "Everyday care",
      text: "Uth jaana, khana kha lena, time pe aana and ghar pahoch kar batana. Somewhere, we became each other's little routine. ❤️",
      photo: "/book/photos/ch5-hands.jpg",
      pos: "50% 45%",
      sticker: "favorite",
    },
    {
      num: "Chapter 06",
      title: "A thousand memories",
      text: "Not every beautiful moment made it into a photograph, but every photograph brings back a thousand little feelings. ✨",
      photo: "/book/photos/ch6-mirror.jpg",
      pos: "40% 50%",
      sticker: "stars",
    },
    {
      num: "Chapter 07",
      title: "Just for you",
      text: "Never lose your beautiful smile, your crazy little personality and the dreams in your eyes. Here's to you, Mansi, and many more beautiful memories. Happy Birthday! ♡",
      photo: "/book/photos/ch7-you.jpg",
      pos: "62% 40%",
      sticker: "envelope",
    },
  ],
};
