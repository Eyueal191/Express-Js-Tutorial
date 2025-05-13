export const createUserValidationSchema = {
  username: {
    notEmpty: {
      errorMessage: "Username can not be empty.",
    },
    isLength: {
      options: { min: 5, max: 32 },
      errorMessage:
        "Username must be at least 5 characters with a max of 32 characters",
    },
  },
  filter: {
    isString: {
      errorMessage: "Must be a string",
    },
    notEmpty: "Must not be empty",
    isLength: {
      options: { min: 5, max: 10 },
      errorMessage: "Username must be at least 5- 10 characters",
    },
  },
};
