using System;
using System.Collections.Generic;
using System.Data;
using App.Domain;
using App.Domain;
using MySql.Data.MySqlClient;

namespace App.Infrastructure
{
    public class ConfigurationRepository
    {

        AppSettings _AppSettings;

        public ConfigurationRepository(AppSettings settings){
            _AppSettings = settings;
        }

		public ConfigurationModel GetConfiguration()
        {

			var result = new List<ConfigurationModel>();

            MySqlConnection connection = new MySqlConnection
            {
                ConnectionString = _AppSettings.ConnectionString
            };
            connection.Open();
            MySqlCommand command = new MySqlCommand("SELECT * FROM configurations LIMIT 0,1;", connection);

            using (MySqlDataReader reader = command.ExecuteReader())
            {
                while (reader.Read())
                {
					result.Add(ConfigurationModel.Create(reader));
                }
            }
            connection.Close();
			return result[0];
        }


		public void UpdateConfiguration(ConfigurationModel conf)
		{

            MySqlConnection connection = new MySqlConnection
            {
                ConnectionString = _AppSettings.ConnectionString
            };
            connection.Open();
			MySqlCommand command = new MySqlCommand(String.Format("Update configurations set date='{0}', time='{1}', assessor='{2}'", conf.Date,conf.Time,conf.Assessor), connection);
            command.ExecuteNonQuery();
            connection.Close();
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