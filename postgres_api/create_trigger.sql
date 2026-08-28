-- PostgreSQL trigger for CDC on persons table
-- Sends NOTIFY events when rows are inserted, updated, or deleted

-- Create trigger function
CREATE OR REPLACE FUNCTION notify_person_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        PERFORM pg_notify('person_changes', json_build_object(
            'operation', 'DELETE',
            'id', OLD.id,
            'name', OLD.name,
            'surname', OLD.surname
        )::text);
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        PERFORM pg_notify('person_changes', json_build_object(
            'operation', 'UPDATE',
            'id', NEW.id,
            'name', NEW.name,
            'surname', NEW.surname,
            'created_at', NEW.created_at
        )::text);
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        PERFORM pg_notify('person_changes', json_build_object(
            'operation', 'INSERT',
            'id', NEW.id,
            'name', NEW.name,
            'surname', NEW.surname,
            'created_at', NEW.created_at
        )::text);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS persons_change_trigger ON persons;

-- Create trigger on persons table
CREATE TRIGGER persons_change_trigger
AFTER INSERT OR UPDATE OR DELETE ON persons
FOR EACH ROW
EXECUTE FUNCTION notify_person_changes();

-- Verify trigger was created
SELECT tgname, tgtype, tgenabled 
FROM pg_trigger 
WHERE tgrelid = 'persons'::regclass;
