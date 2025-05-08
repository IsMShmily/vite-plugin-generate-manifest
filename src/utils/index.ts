import boxen from "boxen";

export const logMsg = (msg: string, borderColor: string = "yellow") => {
  console.log(
    boxen(msg, {
      padding: 1,
      margin: 1,
      borderColor: borderColor,
      borderStyle: "round",
    })
  );
};
