// components/AddHabitForm.tsx

import React from 'react';

/**
 * AddHabitForm Component
 *
 * Provides the basic structure for the form used to add new habits.
 * This component will later be enhanced with ShadCN UI components and
 * connected to a Server Action for handling submissions.
 */
export default function AddHabitForm() {
  // We'll connect this form to a Server Action later using the 'action' prop.
  // The Server Action will handle validation, database insertion, and UI updates.

  return (
    // The <form> element is the container for our input fields and submit button.
    // We'll add the 'action' prop later to link it to our Server Action.
    <form className="space-y-4"> {/* Basic vertical spacing between elements */}

      {/* Input Field for Habit Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
          Habit Name
        </label>
        {/* Placeholder for ShadCN Input */}
        <input
          type="text"
          id="name"
          name="name" // The 'name' attribute is crucial for Server Actions to identify the field
          placeholder="e.g., Drink 8 glasses of water"
          required // Basic HTML5 required validation
          className="block w-full border border-input bg-background rounded-md p-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" // Basic input styling (will be replaced)
        />
        {/* We can add error message display here later */}
      </div>

      {/* Input Field for Habit Description (Optional) */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
          Description (Optional)
        </label>
        {/* Placeholder for ShadCN Textarea or Input */}
        <textarea
          id="description"
          name="description" // 'name' attribute for Server Action
          placeholder="e.g., Track daily water intake for better hydration"
          rows={3}
          className="block w-full border border-input bg-background rounded-md p-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" // Basic textarea styling (will be replaced)
        />
      </div>

      {/* Input Field for Habit Frequency */}
      <div>
        <label htmlFor="frequency" className="block text-sm font-medium text-foreground mb-1">
          Frequency
        </label>
        {/* Placeholder for ShadCN Select or Radio Group */}
        <select
          id="frequency"
          name="frequency" // 'name' attribute for Server Action
          required
          className="block w-full border border-input bg-background rounded-md p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" // Basic select styling (will be replaced)
          defaultValue="daily" // Default selection
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          {/* Add more options if needed (e.g., monthly) */}
        </select>
      </div>

      {/* Submit Button */}
      <div className="pt-2"> {/* Add some padding above the button */}
        {/* Placeholder for ShadCN Button */}
        <button
          type="submit"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full" // Basic button styling (will be replaced)
        >
          Add Habit
        </button>
        {/* We can add loading/pending state indication here later */}
      </div>
    </form>
  );
}