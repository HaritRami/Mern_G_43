import React   from "react";
import PageTitle from "../components/PageTitle";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.js";
import "bootstrap-icons/font/bootstrap-icons.css";
// import "./App.min.css";
const ProductList = () => {
  return (
    <>
    <main id="main" className="main">
      <div className="pagetitle">
        <h1>Data Tables</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="index.html">Home</a>
            </li>
            <li className="breadcrumb-item">Tables</li>
            <li className="breadcrumb-item active">Data</li>
          </ol>
        </nav>
      </div>
      {/* End Page Title */}
      <section className="section">
        <div className="row">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Datatables</h5>
                <p>
                  Add lightweight datatables to your project with using the{" "}
                  <a
                    href="https://github.com/fiduswriter/Simple-DataTables"
                    target="_blank"
                  >
                    Simple DataTables
                  </a>{" "}
                  library. Just add <code>.datatable</code> class name to any
                  table you wish to conver to a datatable
                </p>
                {/* Table with stripped rows */}
                <table className="table datatable">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Name</th>
                      <th scope="col">Position</th>
                      <th scope="col">Age</th>
                      <th scope="col">Start Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">1</th>
                      <td>Brandon Jacob</td>
                      <td>Designer</td>
                      <td>28</td>
                      <td>2016-05-25</td>
                    </tr>
                    <tr>
                      <th scope="row">2</th>
                      <td>Bridie Kessler</td>
                      <td>Developer</td>
                      <td>35</td>
                      <td>2014-12-05</td>
                    </tr>
                    <tr>
                      <th scope="row">3</th>
                      <td>Ashleigh Langosh</td>
                      <td>Finance</td>
                      <td>45</td>
                      <td>2011-08-12</td>
                    </tr>
                  </tbody>
                </table>
                {/* End Table with stripped rows */}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </>
  );
};

export default ProductList;
