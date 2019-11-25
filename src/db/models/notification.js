module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    'Notification',
    {
      receiverId: DataTypes.STRING,
      senderId: DataTypes.STRING,
      scope: DataTypes.STRING,
      scopeId: DataTypes.STRING,
      message: DataTypes.STRING,
      isViewed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    },
    {},
  );
  Notification.associate = (models) => {
    Notification.belongsTo(models.Profile, {
      foreignKey: 'senderId',
      as: 'Sender',
    });
    Notification.belongsTo(models.Profile, {
      foreignKey: 'receiverId',
      as: 'Reciever',
    });
  };
  return Notification;
};
