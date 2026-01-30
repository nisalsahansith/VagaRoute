import React, { useState, useEffect } from "react"
import { View, TextInput, FlatList, TouchableOpacity, Text } from "react-native"
import axios from "axios"

interface Props {
  placeholder: string
  value: string
  onSelect: (val: string) => void
}

export default function LocationSearchInput({
  placeholder,
  value,
  onSelect
}: Props) {
  const [query, setQuery] = useState(value)
  const [results, setResults] = useState<any[]>([])

  useEffect(() => {
    const fetchLocations = async () => {
      if (query.length < 3) {
        setResults([])
        return
      }

      try {
        const res = await axios.get(
            "https://nominatim.openstreetmap.org/search",
            {
                params: {
                q: query,
                format: "json",
                addressdetails: 1,
                limit: 5
                },
                headers: {
                "User-Agent": "VagaRoute/1.0 (contact@vagaroute.app)",
                "Accept-Language": "en"
                }
            }
        )

        setResults(res.data)
      } catch (err) {
        console.log("OSM Error:", err)
      }
    }

    const delay = setTimeout(fetchLocations, 500)
    return () => clearTimeout(delay)
  }, [query])

  return (
    <View>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        className="bg-white p-4 rounded-2xl border border-[#E2E8F0]"
      />

      {results.length > 0 && (
        <View className="bg-white rounded-2xl border border-[#E2E8F0] mt-2 overflow-hidden">
          <FlatList
            data={results}
            keyExtractor={(item) => item.place_id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="p-3 border-b border-[#E2E8F0]"
                onPress={() => {
                  onSelect(item.display_name)
                  setQuery(item.display_name)
                  setResults([])
                }}
              >
                <Text>{item.display_name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  )
}
