const isEmail = email => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
};

// helper function that determines if a field is empty
const iseEmpty = string => {
  if (string.trim() === "") return true;
  //we trim here so that someone who enters 1 space will not let the program consider it "not empty"
  else return false;
};

exports.validateSignupData = (data) => {
  let errors = {};

  if (iseEmpty(data.email)) {
    errors.email = "Email must not be empty";
  } else if (!isEmail(data.email)) {
    errors.email = "Must be a valid email address";
  }

  if (iseEmpty(data.password)) errors.password = "Must not be empty";
  if (data.password !== data.confirmPassword)
    errors.confirmPassword = "Passwords must match";
  if (iseEmpty(data.handle)) errors.handle = "Must not be empty";

  return {
      errors, 
      valid: Object.keys(errors).length === 0 ? true : false
  }
};

exports.validateLoginData = (data) => {
    let errors = {};
  
    if (iseEmpty(user.email)) errors.email = "Must not be empty";
    if (iseEmpty(user.password)) errors.password = "Must not be empty";

    return {
        errors, 
        valid: Object.keys(errors).length === 0 ? true : false
    }
}