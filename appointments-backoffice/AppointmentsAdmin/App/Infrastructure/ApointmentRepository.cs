using System;
using System.Collections.Generic;
using System.Data;
using App.Domain;
using App.Domain;
using MySql.Data.MySqlClient;

namespace App.Infrastructure
{
    public class AppointmentRepository
    {

        AppSettings _AppSettings;

        public AppointmentRepository(AppSettings settings){
            _AppSettings = settings;
        }

		public List<AppointmentModel> GetAppointments()
        {

			var result = new List<AppointmentModel>();

            MySqlConnection connection = new MySqlConnection
            {
                ConnectionString = _AppSettings.ConnectionString
            };
            connection.Open();
            MySqlCommand command = new MySqlCommand("SELECT * FROM appointments order by Id desc;", connection);

            using (MySqlDataReader reader = command.ExecuteReader())
            {
                while (reader.Read())
                {
					result.Add(AppointmentModel.Create(reader));
                }
            }
            connection.Close();
            return result;
        }

        /*
		public BlackListModel GetBlackListItem(int id)
		{

			var result = new BlackListModel();

			MySqlConnection connection = new MySqlConnection
			{
                ConnectionString = _AppSettings.ConnectionString
			};
			connection.Open();
            MySqlCommand command = new MySqlCommand(String.Format("SELECT * FROM blacklist where id={0};",id), connection);

			using (MySqlDataReader reader = command.ExecuteReader())
			{
				while (reader.Read())
				{
					result = BlackListModel.Create(reader);
				}
			}
			connection.Close();
            return result;
		}

        public void DeleteBlackListItem(int id)
        {

            var result = new List<BlackListModel>();

            MySqlConnection connection = new MySqlConnection
            {
                ConnectionString = _AppSettings.ConnectionString
            };
            connection.Open();
            MySqlCommand command = new MySqlCommand(String.Format("DELETE FROM blacklist where id={0};", id), connection);
            command.ExecuteNonQuery();
            connection.Close();
        }

        public void AddBlackListItem(BlackListModel model)
        {
            {
                if (!String.IsNullOrEmpty(model.dnOrPattern) && !String.IsNullOrEmpty(model.Reason))
                {

                    var result = new List<BlackListModel>();

                    MySqlConnection connection = new MySqlConnection
                    {
                        ConnectionString = _AppSettings.ConnectionString
                    };
                    connection.Open();

                    String query = String.Format("INSERT INTO BlackList "
                        + "(`dnOrPattern`, `reason`) VALUES ('{0}', '{1}')", model.dnOrPattern, model.Reason);

                    MySqlCommand command = new MySqlCommand(query, connection);
                    command.ExecuteNonQuery();
                    connection.Close();
                }
                else
                {
                    throw new Exception("Por favor proporcione todos los valores");
                }
            }

        }*/
    }
}