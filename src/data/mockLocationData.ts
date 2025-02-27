// data/mockLocationData.ts
// Mock location data for suggestions

export const mockLocationData = [
    "123 Main Street, New York, NY",
    "456 Broadway Avenue, Los Angeles, CA",
    "789 Michigan Avenue, Chicago, IL",
    "101 Market Street, San Francisco, CA",
    "202 Peachtree Street, Atlanta, GA",
    "303 Bourbon Street, New Orleans, LA",
    "404 Las Vegas Boulevard, Las Vegas, NV",
    "505 Beale Street, Memphis, TN",
    "606 Ocean Drive, Miami Beach, FL",
    "707 Newbury Street, Boston, MA",
    "808 King Street, Charleston, SC",
    "909 Pennsylvania Avenue, Washington DC",
    "1010 Rodeo Drive, Beverly Hills, CA",
    "1111 Pike Place, Seattle, WA",
    "1212 Sixth Street, Austin, TX",
    "1313 Canal Street, New York, NY",
    "1414 Lombard Street, San Francisco, CA",
    "1515 Fremont Street, Las Vegas, NV",
    "1616 Melrose Avenue, Los Angeles, CA",
    "1717 Royal Street, New Orleans, LA",
    "1818 Congress Avenue, Austin, TX",
    "1919 Duval Street, Key West, FL",
    "2020 Collins Avenue, Miami Beach, FL",
    "2121 River Street, Savannah, GA",
    "2222 Walnut Street, Philadelphia, PA",
    "2323 Commercial Street, Portland, ME",
    "2424 Riverside Drive, Portland, OR",
    "2525 Thames Street, Newport, RI",
    "2626 State Street, Santa Barbara, CA",
    "2727 Wall Street, New York, NY",
    "2828 Riverside Avenue, Jacksonville, FL",
    "2929 Miracle Mile, Coral Gables, FL",
    "3030 Chestnut Street, Philadelphia, PA",
    "3131 Music Row, Nashville, TN",
    "3232 Sunset Boulevard, Los Angeles, CA",
    "3333 Alamo Plaza, San Antonio, TX",
    "3434 Bedford Avenue, Brooklyn, NY",
    "3535 Union Square, San Francisco, CA",
    "3636 Magazine Street, New Orleans, LA",
    "3737 First Street, Louisville, KY",
    "3838 Fourth Avenue, Anchorage, AK",
    "3939 Central Avenue, Phoenix, AZ",
    "4040 Michigan Street, Milwaukee, WI",
    "4141 Monument Avenue, Richmond, VA",
    "4242 Lincoln Road, Miami Beach, FL",
    "4343 Park Avenue, Winter Park, FL",
    "4444 Elm Street, Dallas, TX",
    "4545 Grant Street, Pittsburgh, PA",
    "4646 Cherokee Street, St. Louis, MO",
    "4747 Pearl Street, Boulder, CO"
  ];
  
  // Function to filter locations based on a search query
  export const filterLocations = (query: string, limit: number = 5): string[] => {
    if (!query.trim()) return [];
  
    return mockLocationData
      .filter(location => location.toLowerCase().includes(query.toLowerCase()))
      .slice(0, limit);
  };