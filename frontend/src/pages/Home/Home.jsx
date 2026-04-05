import React, { useState } from 'react'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import AppDownload from '../../components/AppDownload/AppDownload'
import SearchBar from '../../components/SearchBar/SearchBar'

const Home = ({ showSearch, searchQuery, setSearchQuery }) => {

  const [category, setCategory] = useState("All")

  return (
      <>
        <Header/>
        {showSearch && (
          <SearchBar query={searchQuery} setQuery={setSearchQuery}/>
        )}
        <ExploreMenu setCategory={setCategory} category={category}/>
        <FoodDisplay category={category} searchQuery={searchQuery}/>
        <AppDownload/>
      </>
    )
}

export default Home