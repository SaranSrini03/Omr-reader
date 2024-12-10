export default function Result({ mismatches }) {
    return (
      <div>
        <h1>OMR Comparison Results</h1>
        {mismatches.length === 0 ? (
          <p>No mismatches detected.</p>
        ) : (
          <ul>
            {mismatches.map((position, index) => (
              <li key={index}>Row: {position.row}, Column: {position.col}</li>
            ))}
          </ul>
        )}
      </div>
    );
  }
  
  export async function getServerSideProps() {
    return { props: { mismatches: [] } };
  }
  