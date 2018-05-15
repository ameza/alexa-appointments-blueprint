using System;
using System.ComponentModel.DataAnnotations;
using System.Data;

namespace App.Domain
{
    public class AppointmentModel
    {
       
	    public String Id {
	    get;
	    set;
	    }
        [Required]
		public String email
		{
			get;
			set;
		}
        [Required]
		public String Branch
		{
			get;
			set;
		}
		[Required]
        public String Service
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
        public String StartTime
        {
            get;
            set;
        }
		[Required]
        public String EndTime
        {
            get;
            set;
        }
		[Required]
        public String Date
        {
            get;
            set;
        }

		public static AppointmentModel Create(IDataRecord record) => new AppointmentModel()
		{
			Id = (record["id"] is DBNull) ? null : record["id"].ToString(),
			Branch = (record["branch"] is DBNull) ? null : record["branch"].ToString(),
			Service = (record["service"] is DBNull) ? null : record["service"].ToString(),
			Assessor = (record["assessor"] is DBNull) ? null : record["assessor"].ToString(),
			StartTime = (record["startTime"] is DBNull) ? null : record["startTime"].ToString(),
			EndTime = (record["endTime"] is DBNull) ? null : record["endTime"].ToString(),
			Date = (record["date"] is DBNull) ? null : record["date"].ToString(),

		};

	}
}
