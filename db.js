const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Test connection
async function testConnection() {
  const { data, error } = await supabase.from("users").select("id").limit(1);
  if (error) {
    console.error("Supabase connection error:", error.message);
  } else {
    console.log("Supabase connected successfully");
  }
}

testConnection();

module.exports = { supabase };
