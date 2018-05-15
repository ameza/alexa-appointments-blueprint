using System;
using System.ComponentModel.DataAnnotations;
using System.Data;

namespace App.Domain
{
    public class ConfigurationModel
    {
       
	    public String Id {
	    get;
	    set;
	    }
        [Required]
		public String Date
		{
			get;
			set;
		}
        [Required]
		public String Time
		{
			get;
			set;
		}
		[Required]
		public String Assessor
        {
            get;
            set;
        }

		[Required]
		public int SlotSizeMinutes
        {
            get;
            set;
        }


        
		public static ConfigurationModel Create(IDataRecord record)
		{
			return new ConfigurationModel()
			{
                Id = (record["id"] is DBNull)?null:record["id"].ToString(),
				Date = (record["date"] is DBNull) ? null : record["date"].ToString(),
                Time = (record["time"] is DBNull) ? null : record["time"].ToString(),
                Assessor = (record["assessor"] is DBNull) ? null : record["assessor"].ToString(),
				SlotSizeMinutes = (record["slotSizeMinutes"] is DBNull) ? 0 : (int)record["slotSizeMinutes"]

			};
		}
  
		public override string ToString()
		{
			return "Date: "+Date+" Time: "+Time+" Assessor: "+Assessor;
		}
    
    }
}
