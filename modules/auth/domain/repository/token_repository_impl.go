package repository

import (
	"Ravit/internal/pkg/database"
	"Ravit/modules/auth/domain/entity"
	"context"
	"errors"
)

type TokenRepositoryImpl struct{}

// Create implements TokenRepository.
func (r TokenRepositoryImpl) Create(ctx context.Context, token *entity.Token) error {
	return database.DB.WithContext(ctx).Create(token).Error
}

// FindByToken implements TokenRepository.
func (r TokenRepositoryImpl) FindByToken(ctx context.Context, tokenString string) (*entity.Token, error) {
	var token entity.Token
	result := database.DB.WithContext(ctx).Where("token = ?", tokenString).First(&token)
	if result.Error != nil {
		if result.RowsAffected == 0 {
			return nil, errors.New("token not found")
		}
		return nil, result.Error
	}
	return &token, nil
}

// FindByUserID implements TokenRepository.
func (r TokenRepositoryImpl) FindByUserID(ctx context.Context, userID uint) (*entity.Token, error) {
	var token entity.Token
	result := database.DB.WithContext(ctx).Where("user_id = ?", userID).First(&token)
	if result.Error != nil {
		if result.RowsAffected == 0 {
			return nil, errors.New("token not found")
		}
		return nil, result.Error
	}
	return &token, nil
}

// DeleteByUserID implements TokenRepository.
func (r TokenRepositoryImpl) DeleteByUserID(ctx context.Context, userID uint) error {
	return database.DB.WithContext(ctx).Where("user_id = ?", userID).Delete(&entity.Token{}).Error
}

// Delete implements TokenRepository.
func (r TokenRepositoryImpl) Delete(ctx context.Context, id uint) error {
	return database.DB.WithContext(ctx).Delete(&entity.Token{}, id).Error
}

func NewTokenRepositoryImpl() TokenRepository {
	return TokenRepositoryImpl{}
}
