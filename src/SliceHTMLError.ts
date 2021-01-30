class SliceHTMLError extends Error {
  constructor(...props: any[]) {
    super(...props);

    this.name = "SliceHTMLError";
  }
}

export { SliceHTMLError };
