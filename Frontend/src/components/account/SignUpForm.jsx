import { Field, reduxForm } from "redux-form";
import { compose } from "redux";
import { Link } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import renderFormGroupField from "../../helpers/renderFormGroupField";
import renderFormField from "../../helpers/renderFormField";
import {
  required,
  maxLength20,
  minLength8,
  email,
  name,
  mobile
} from "../../helpers/validation";
import { ReactComponent as IconMail } from "bootstrap-icons/icons/envelope.svg";
import { ReactComponent as IconShieldLock } from "bootstrap-icons/icons/shield-lock.svg";
import { ReactComponent as IconPhone } from "bootstrap-icons/icons/phone.svg";

const SignUpForm = (props) => {
  const { handleSubmit, submitting, onSubmit, submitFailed } = props;
  const { user } = useUser();

  const onFormSubmit = (formValues) => {
    console.log("Form values before submission:", formValues); // Debug log
    return onSubmit(formValues);
  };

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className={`needs-validation ${submitFailed ? "was-validated" : ""}`}
      noValidate
    >
      <div className="row mb-3">
        <div className="col-md-12">
          <Field
            name="name"
            type="text"
            label="Full Name"
            component={renderFormField}
            placeholder="Full Name"
            validate={[required, name]}
            required={true}
          />
        </div>
      </div>

      <Field
        name="email"
        type="email"
        label="Email"
        component={renderFormGroupField}
        placeholder="Enter your email"
        icon={IconMail}
        validate={[required, email]}
        required={true}
        className="mb-3"
      />

      <Field
        name="mobile"
        type="tel"
        label="Mobile Number"
        component={renderFormGroupField}
        placeholder="Enter your mobile number"
        icon={IconPhone}
        validate={[required, mobile]}
        required={true}
        maxLength="10"
        minLength="10"
        inputMode="numeric"
        pattern="[0-9]*"
        className="mb-3"
      />

      <Field
        name="password"
        type="password"
        label="Password"
        component={renderFormGroupField}
        placeholder="******"
        icon={IconShieldLock}
        validate={[required, maxLength20, minLength8]}
        required={true}
        maxLength="20"
        minLength="8"
        className="mb-3"
      />

      <div className="d-grid">
        <button
          type="submit"
          className="btn btn-primary mb-3"
          disabled={submitting}
        >
          {submitting ? "Registering..." : "Register"}
        </button>
      </div>

      <Link className="float-start" to="/account/signin" title="Sign In">
        Already have an account? Sign In
      </Link>

      <div className="clearfix"></div>
      <hr></hr>
      <div className="row">
        <div className="col- text-center">
          <p className="text-muted small">Or you can join with</p>
        </div>
        <div className="col- text-center">
          <Link to="/" className="btn btn-light text-white bg-twitter me-3">
            <i className="bi bi-twitter-x" />
          </Link>
          <Link to="/" className="btn btn-light text-white me-3 bg-facebook">
            <i className="bi bi-facebook mx-1" />
          </Link>
          <Link to="/" className="btn btn-light text-white me-3 bg-google">
            <i className="bi bi-google mx-1" />
          </Link>
        </div>
      </div>
    </form>
  );
};

// Initialize form with redux-form
const SignUpFormRedux = reduxForm({
  form: "signup",
  onSubmitSuccess: (result, dispatch, props) => {
    console.log("Form submitted successfully:", result); // Debug log
  },
  onSubmitFail: (errors, dispatch, submitError, props) => {
    console.error("Form submission failed:", errors, submitError); // Debug log
  }
})(SignUpForm);

export default SignUpFormRedux;
