// SearchBar.jsx — new component, add to src/components/SearchBar/
import React from "react";
import "./SearchBar.css";
import { assets } from "../../assets/assets";

const SearchBar = ({ query, setQuery }) => {
  return (
    <div className="search-bar">
      <img src={assets.search_icon} alt="search" />
      <input
        type="text"
        placeholder="Search for dishes..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query && (
        <span className="search-clear" onClick={() => setQuery("")}>
          ✕
        </span>
      )}
    </div>
  );
};

export default SearchBar;
