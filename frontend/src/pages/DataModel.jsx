export default function DataModel() {
  return (
    <>
      <section className="page-hero">
        <h1 className="page-title">About FlightX</h1>
        <p className="page-sub">
          FlightX helps you discover how to get from one city to another, including trips that need
          a stop or two along the way.
        </p>
      </section>

      <div className="about-grid">
        <article className="about-card">
          <h3>Search by city</h3>
          <p>
            Type the city you are leaving from and where you want to go. Choose the right airport
            from the suggestions, just like on other travel websites.
          </p>
        </article>
        <article className="about-card">
          <h3>See all useful options</h3>
          <p>
            We show non-stop flights when they exist, and connecting flights when they do not, so you
            still have ways to reach your destination.
          </p>
        </article>
        <article className="about-card">
          <h3>Filter what matters</h3>
          <p>
            Prefer fewer stops? Adjust the stops filter and search again to narrow the list.
          </p>
        </article>
        <article className="about-card">
          <h3>Clear flight details</h3>
          <p>
            Every result shows the route, number of stops, distance, and which airlines operate each
            leg, so comparing options feels simple.
          </p>
        </article>
      </div>
    </>
  );
}
