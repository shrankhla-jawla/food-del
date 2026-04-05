// FoodDisplay.jsx — replaces the existing one in src/components/FoodDisplay/
// Changes: accepts `searchQuery` prop, combines it with category filter
import React, { useContext } from "react";
import "./FoodDisplay.css";
import FoodItem from "../FoodItem/FoodItem";
import { StoreContext } from "../../context/StoreContext";

const FoodDisplay = ({ category, searchQuery }) => {
  console.log("searchQuery:", searchQuery)
  const { food_list } = useContext(StoreContext);

  // Combine both filters: category AND search query
  const filteredList = food_list.filter((item) => {
    const matchesCategory =
      category === "All" || category === item.category;

    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="food-display" id="food-display">
      <h2>Top dishes near you</h2>

      {filteredList.length === 0 ? (
        <div className="food-display-empty">
          <p>😕 No dishes found for "<strong>{searchQuery}</strong>"</p>
          <span>Try a different name or category</span>
        </div>
      ) : (
        <div className="food-display-list">
          {filteredList.map((item) => (
            <FoodItem
              key={item._id}
              id={item._id}
              name={item.name}
              description={item.description}
              price={item.price}
              image={item.image}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FoodDisplay;
