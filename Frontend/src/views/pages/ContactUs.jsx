import { lazy } from "react";
const ContactUsForm = lazy(() => import("../../components/ContactUsForm"));

const ContactUsView = () => {
  const onSubmit = async (values) => {
    alert(JSON.stringify(values));
  };

  return (
    <div className="container my-5">
      
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold text-dark">Get In Touch</h1>
        <p className="lead text-muted max-w-sm mx-auto">
          Our dedicated team is here to assist you. Drop us a message or visit our official NexaMart locations below!
        </p>
      </div>

      <div className="row g-5">
        {/* Left Side: Information & Locations */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body p-4 p-md-5">
              <h4 className="fw-bold mb-4 d-flex align-items-center">
                <i className="bi bi-buildings-fill text-primary me-3 fs-3"></i> 
                Our Offices
              </h4>
              
              <div className="mb-4 pb-4 border-bottom">
                <h5 className="fw-bold text-dark mb-3">Headquarters</h5>
                <address className="text-muted">
                  <strong className="text-dark">NexaMart Global Inc.</strong><br />
                  1355 Market St, Suite 900<br />
                  San Francisco, CA 94103<br />
                  <div className="mt-3 d-flex align-items-center">
                    <i className="bi bi-telephone-fill text-primary me-2"></i> +1 (123) 456-7890
                  </div>
                  <div className="mt-2 d-flex align-items-center">
                    <i className="bi bi-envelope-fill text-primary me-2"></i> support@nexamart.com
                  </div>
                </address>
              </div>

              <div>
                <h5 className="fw-bold text-dark mb-3">European Hub</h5>
                <address className="text-muted mb-0">
                  <strong className="text-dark">NexaMart Ltd.</strong><br />
                  100 Liverpool St<br />
                  London EC2M 2AT, UK<br />
                  <div className="mt-3 d-flex align-items-center">
                    <i className="bi bi-telephone-fill text-primary me-2"></i> +44 20 7123 4567
                  </div>
                </address>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d313635.5491853188!2d-122.57606416467848!3d37.20933611930123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085815c67b3754d%3A0xb42714f3436732f2!2s1355%20Market%20St%20%23900%2C%20San%20Francisco%2C%20CA%2094103%2C%20USA!5e0!3m2!1sen!2sin!4v1599193189366!5m2!1sen!2sin"
              title="Location"
              width="100%"
              height="300"
              style={{ border: 0, display: "block" }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>

        {/* Right Side: Sticky Contact Form */}
        <div className="col-lg-7">
          <div className="position-sticky" style={{ top: "2rem" }}>
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-header bg-primary text-white p-4 py-3 rounded-top-4 border-0 d-flex align-items-center">
                <i className="bi bi-chat-left-dots-fill fs-4 me-3"></i>
                <h4 className="mb-0 fw-bold">Send us a Message</h4>
              </div>
              <div className="card-body p-4 p-md-5">
                <ContactUsForm onSubmit={onSubmit} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsView;
