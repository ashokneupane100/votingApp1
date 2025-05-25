import { useEffect, useState } from "react";
import { Text, View,Button } from "react-native";
import {useAuth} from "@/src/providers/AuthProvider"
import {  } from "@react-navigation/elements";
import { supabase } from "../../lib/supabase";
import { Redirect } from "expo-router";

export default function ProfileScreen() {
  const{session,user}=useAuth();


  return (
    <View style={{padding:10}}>

      <Text>User id:{user?.id}</Text>

      <Button title="Sign out" onPress={()=>supabase.auth.signOut()} />
    </View>
  );
}
