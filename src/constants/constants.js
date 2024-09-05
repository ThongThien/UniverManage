export const backgroundColors = [
    "FF5733",
    "FFC300",
    "FFFF66",
    "CCFF66",
    "66FF66",
    "66FFCC",
    "66FFFF",
    "66CCFF",
    "6666FF",
    "CC66FF",
    "FF66FF",
    "FF6F61",
    "6B5B95",
    "88B04B",
    "F7CAC9",
    "92A8D1",
  ];
export const generateRandomString = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};