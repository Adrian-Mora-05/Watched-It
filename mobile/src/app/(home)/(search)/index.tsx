import { View, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from "@react-native-ama/react-native";
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '@/services/supabase';
import { useLayout } from '@/hooks/useLayout';

import MenuBar from "@/components/ui/MenuBar";
import Input from "@/components/ui/Input";
import Ionicons from '@expo/vector-icons/Ionicons';
import TitleGrid from '@/components/ui/TitleGrid';

type SearchTab =
  | "movies"
  | "shows"
  | "users"
  | "lists";

export default function SearchScreen() {

  const {
    headerHeight,
    screenWidth,
    headerPaddingBottom,
    paddingHorizontal,
    paddingVertical
  } = useLayout();

  const [tab, setTab] =
    useState<SearchTab>("movies");

  const [showFilters, setShowFilters] =
    useState(false);

  const [search, setSearch] =
    useState('');

  const [results, setResults] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [year, setYear] =
    useState('');

  const [country, setCountry] =
    useState('');

  const [genre, setGenre] =
    useState('');

  const [duration, setDuration] =
    useState('');

  const [hasAgeRestriction, setHasAgeRestriction] =
    useState<boolean | null>(null);

  const tabs = [
    { key: "movies", label: "Películas" },
    { key: "shows", label: "Series" },
    { key: "users", label: "Usuarios" },
    { key: "lists", label: "Listas" },
  ];

  const renderPlaceholder = () => {

    switch (tab) {

      case "movies":
        return "Título de la película...";

      case "shows":
        return "Título de la serie...";

      case "users":
        return "Nombre de usuario...";

      case "lists":
        return "Nombre de la lista...";
    }
  };

  useEffect(() => {

    const timeout = setTimeout(() => {
      fetchResults();
    }, 400);

    return () => clearTimeout(timeout);

  }, [
    search,
    year,
    country,
    genre,
    duration,
    hasAgeRestriction,
    tab
  ]);

  const fetchResults = async () => {

    try {

      setLoading(true);

      let endpoint = '';

      const params =
        new URLSearchParams();

      // SEARCH
      if (search) {

        if (tab === 'movies') {
          params.append('title', search);
        }

        if (tab === 'shows') {
          params.append('title', search);
        }

        if (tab === 'users') {
          params.append('name', search);
        }

        if (tab === 'lists') {
          params.append('name', search);
        }
      }

      // FILTERS
      if (year) {
        params.append('year', year);
      }

      if (country) {
        params.append('country', country);
      }

      if (genre) {
        params.append('genres', genre);
      }

      if (duration && tab === 'movies') {
        params.append(
        'minLength',
        String(Number(duration))
      );
      }

      if (hasAgeRestriction !== null) {

        params.append(
          'ageRestriction',
          String(hasAgeRestriction)
        );
      }

      // ENDPOINTS
      switch (tab) {

        case 'movies':
          endpoint =
            `/movie?${params.toString()}`;
          break;

        case 'shows':
          endpoint =
            `/show?${params.toString()}`;
          break;

        case 'users':
          endpoint =
            `/user/search?${params.toString()}`;
          break;

        case 'lists':
          endpoint =
            `/list/search?${params.toString()}`;
          break;
      }

      const {
        data: { session }
      } = await supabase.auth.getSession();

      const token =
        session?.access_token;
        
      const response = await fetch(
        `http://192.168.1.10:3000/api${endpoint}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const json =
        await response.json();

      console.log(json);

      const rawResults =
        Array.isArray(json.data)
          ? json.data
          : Array.isArray(json)
            ? json
            : [];

      const normalizedResults =
        rawResults.map((item: any) => ({

          id:
            item.id,

          title:
            item.title ||
            item.nombre ||
            item.nombre_lista,

          image_link:
            item.image_link ||
            item.enlace_imagen ||
            null,

          type:
            tab,
        }));

      setResults(normalizedResults);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);
    }
  };

  return (

    <ScrollView
      className="flex-1 bg-dark"
      contentContainerStyle={{
        paddingBottom: 120
      }}
    >

      {/* HEADER */}
      <View
        className="items-center justify-end bg-chocolate"
        style={{
          height: headerHeight,
          width: screenWidth
        }}
      >

        <Text
          className="text-white text-large font-bold"
          style={{
            paddingBottom: headerPaddingBottom
          }}
        >
          Watched It
        </Text>

      </View>

      {/* CONTENT */}
      <View
        className="flex-1"
        style={{
          paddingHorizontal,
          paddingVertical,
          gap: 18
        }}
      >

        {/* TOP BAR */}
        <MenuBar
          tabs={tabs}
          activeTab={tab}
          onChange={(value) => {

            setTab(value as SearchTab);

            setShowFilters(false);

            setResults([]);

            setSearch('');

          }}
        />

        {/* SEARCH ROW */}
        <View className="flex-row items-center">

          <Ionicons
            name="search"
            size={screenWidth * 0.045}
            color="white"
            style={{ marginRight: 8 }}
          />

          <Text
            className="text-white font-bold mr-3"
            style={{
              fontSize: screenWidth * 0.045
            }}
          >
            Buscar:
          </Text>

          <View className="flex-1">

            <Input
              label="Buscar"
              hideLabel
              placeholder={renderPlaceholder()}
              value={search}
              onChangeText={setSearch}
              className="bg-white text-black rounded-xl px-4 py-3"
            />

          </View>

          {(tab === "movies" ||
            tab === "shows") && (

            <TouchableOpacity
              onPress={() =>
                setShowFilters(!showFilters)
              }
              className="ml-3 items-center justify-center"
              style={{
                width: 48,
                height: 48,
              }}
            >

              <Text className="text-white text-xl">
                {showFilters ? '▲' : '▼'}
              </Text>

            </TouchableOpacity>
          )}

        </View>

        {/* FILTERS */}
        {showFilters && (
          <View className="gap-4">

            {/* AÑO */}
            <View className="flex-row items-center justify-end">

              <Text
                className="text-white mr-2"
                style={{ width: 55 }}
              >
                Año:
              </Text>

              <View style={{ width: 170 }}>

                <Input
                  label="Año"
                  hideLabel
                  keyboardType="numeric"
                  value={year}
                  onChangeText={(text: string) => {

                    const onlyNumbers =
                      text.replace(/[^0-9]/g, '');

                    setYear(onlyNumbers);

                  }}
                  className="bg-white text-black rounded-xl"
                />

              </View>

            </View>

            {/* PAÍS */}
            <View className="flex-row items-center justify-end">

              <Text
                className="text-white mr-2"
                style={{ width: 55 }}
              >
                País:
              </Text>

              <View style={{ width: 170 }}>

                <Input
                  label="País"
                  hideLabel
                  value={country}
                  onChangeText={setCountry}
                  className="bg-white text-black rounded-xl"
                />

              </View>

            </View>

            {/* GÉNERO */}
            <View className="flex-row items-center justify-end">

              <Text
                className="text-white mr-2"
                style={{ width: 55 }}
              >
                Género:
              </Text>

              <View style={{ width: 170 }}>

                <Input
                  label="Género"
                  hideLabel
                  value={genre}
                  onChangeText={setGenre}
                  className="bg-white text-black rounded-xl"
                />

              </View>

            </View>

            {/* DURACIÓN */}
            {tab === "movies" && (

              <View className="flex-row items-center justify-end">

                <Text
                  className="text-white mr-2"
                  style={{ width: 70 }}
                >
                  Duración:
                </Text>

                <View
                  style={{
                    width: 170,
                    position: 'relative',
                    justifyContent: 'center',
                  }}
                >

                  <Input
                    label="Duración"
                    hideLabel
                    keyboardType="numeric"
                    value={duration}
                    onChangeText={(text: string) => {

                      const onlyNumbers =
                        text.replace(/[^0-9]/g, '');

                      setDuration(onlyNumbers);

                    }}
                    className="bg-white text-black rounded-xl pr-14"
                  />

                  {duration.length > 0 && (
                    <Text
                      style={{
                        position: 'absolute',
                        right: 14,
                        color: 'black',
                        fontWeight: 'bold',
                      }}
                    >
                      mins
                    </Text>
                  )}

                </View>

              </View>
            )}

            {/* RESTRICCIÓN */}
            <View className="flex-row items-center justify-end">

              <Text
                className="text-white mr-2"
                style={{ width: 140 }}
              >
                Restricción de edad:
              </Text>

              <View className="flex-row gap-2">

                {/* SÍ */}
                <TouchableOpacity
                  onPress={() => {

                    if (hasAgeRestriction === true) {
                      setHasAgeRestriction(null);
                    } else {
                      setHasAgeRestriction(true);
                    }

                  }}
                  className={`w-16 h-12 items-center justify-center rounded-xl ${
                    hasAgeRestriction === true
                      ? "bg-blue-600"
                      : "bg-white"
                  }`}
                >

                  <Text
                    className={
                      hasAgeRestriction === true
                        ? "text-white font-bold"
                        : "text-black"
                    }
                  >
                    Sí
                  </Text>

                </TouchableOpacity>

                {/* NO */}
                <TouchableOpacity
                  onPress={() => {

                    if (hasAgeRestriction === false) {
                      setHasAgeRestriction(null);
                    } else {
                      setHasAgeRestriction(false);
                    }

                  }}
                  className={`w-16 h-12 items-center justify-center rounded-xl ${
                    hasAgeRestriction === false
                      ? "bg-blue-600"
                      : "bg-white"
                  }`}
                >

                  <Text
                    className={
                      hasAgeRestriction === false
                        ? "text-white font-bold"
                        : "text-black"
                    }
                  >
                    No
                  </Text>

                </TouchableOpacity>

              </View>

            </View>

          </View>
        )}

      </View>

      {/* RESULTS */}
      {(tab === "movies" || tab === "shows") ? (

        <View
          className="mt-6 flex-row flex-wrap"
          style={{
            rowGap: 8,
            columnGap: 4,
            justifyContent: 'space-between',
            paddingHorizontal: 10,
          }}
        >

          {results.map((item, index) => (

            <TitleGrid
              key={`${item.id}-${index}`}
              item={item}
              onPress={() => {

                if (tab === "movies") {
                  router.push(`/movie/${item.id}`);
                  return;
                }

                if (tab === "shows") {
                  router.push(`/show/${item.id}`);
                  return;
                }

              }}
            />

          ))}

        </View>

      ) : (

        <View className="mt-6 gap-3 px-4">

          {results.map((item, index) => (

            <TouchableOpacity
              key={`${item.id}-${index}`}
              className="bg-white rounded-xl px-4 py-4"
              onPress={() => {

                if (tab === "lists") {
                  router.push(`/list/${item.id}`);
                  return;
                }

                if (tab === "users") {
                  router.push(`/user/${item.id}`);
                  return;
                }

              }}
            >

              <Text className="text-black font-bold">
                {item.title}
              </Text>

            </TouchableOpacity>

          ))}

        </View>

      )}

    </ScrollView>    
  );
}