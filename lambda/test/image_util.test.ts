describe("example", () => {
  it("test01", () => {
    const base64Str = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI";
    console.log(base64Str.replace(/^data:image.*;base64,/, ""));
  });
});
