-- Create meals table
CREATE TABLE IF NOT EXISTS meals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    meals JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, date)
);

-- Create index on user_id and date for faster lookups
CREATE INDEX IF NOT EXISTS idx_meals_user_id_date ON meals(user_id, date);

-- Enable Row Level Security
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own data
CREATE POLICY "Users can view their own meals"
    ON meals
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own data
CREATE POLICY "Users can insert their own meals"
    ON meals
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own data
CREATE POLICY "Users can update their own meals"
    ON meals
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to delete their own data
CREATE POLICY "Users can delete their own meals"
    ON meals
    FOR DELETE
    USING (auth.uid() = user_id); 