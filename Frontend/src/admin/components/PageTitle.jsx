const PageTitle = (prps)=>{
    return (
        <div className="pagetitle">
        <h1>{prps.title}</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="index.html">Home</a>
            </li>
          </ol>
        </nav>
      </div>
    )
}

export default PageTitle;